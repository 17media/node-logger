import http from 'http';
import { createLogger } from '../index';
import { AddressInfo } from 'net';

/**
 * 整合測試：確保 Logger 真的能透過網路發送資料
 * 此測試會自動啟動與關閉一個臨時的 Mock Server，完全不需要手動干預。
 */
describe('Logger Integration (Automation)', () => {
  let server: http.Server;
  let serverPort: number;
  let receivedData: any = null;

  beforeAll((done) => {
    // 建立一個臨時的接收伺服器
    server = http.createServer((req, res) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          receivedData = JSON.parse(body);
        } catch (e) {
          receivedData = body;
        }
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
      });
    });

    // listen(0) 代表由作業系統隨機分配可用埠號，這對 CI/CD 自動化至關重要
    server.listen(0, '127.0.0.1', () => {
      serverPort = (server.address() as AddressInfo).port;
      done();
    });
  });

  afterAll((done) => {
    // 測試結束後務必關閉 Server，釋放資源
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  it('should automatically deliver logs to collector without manual setup', async () => {
    const loggerConfig = {
      base: {
        project: 'auto-test',
        environment: 'ci',
      },
      Fluentd: {
        collectorUrl: `http://127.0.0.1:${serverPort}`,
      },
      Console: false,
    };

    const logger = createLogger(loggerConfig as any)('automation');
    
    // 發送測試日誌
    await logger.info('Test Automation Message', { 
      foo: 'bar', 
      nested: { level: 2 } 
    });

    // 驗證結果
    expect(receivedData).not.toBeNull();
    expect(receivedData.message).toBe('Test Automation Message');
    expect(receivedData.foo).toBe('bar');
    expect(receivedData.nested_level).toBe(2); // 驗證扁平化與 Key 轉換
    expect(receivedData.project).toBe('auto-test');
  });
});

import { WebClient } from '@slack/web-api';

import Logger from './logger';
import { hasAllKeys, formatLogLevel } from '../utils';
import { LogMessageInterface, SlackLoggerConfig } from '../types';
import { LogLevel } from '../enum/level';

// Slack 服務必要配置項
const requiredConfig = ['slackToken', 'slackChannel'];

/**
 * 根據 LogLevel 決定 Slack 訊息旁的側邊顏色
 */
function formatLogLevelSlackColor(logLevel: LogLevel) {
  const colors: Record<number, string> = {
    [LogLevel.DEBUG]: 'good',
    [LogLevel.INFO]: 'good',
    [LogLevel.WARN]: 'warning',
    [LogLevel.ERROR]: 'danger',
    [LogLevel.FATAL]: 'danger',
  };
  return colors[logLevel] || 'good';
}

/**
 * 格式化訊息內容，支援最大行數截斷
 */
function formatMessage(val: any, maxLine?: number) {
  const message =
    typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
  if (!maxLine) {
    return message;
  }

  return message.split('\n').slice(0, maxLine).join('\n');
}

/**
 * Slack 通知服務
 */
class SlackLogger extends Logger<SlackLoggerConfig> {
  private slackClient?: WebClient;

  /**
   * 驗證 Slack 配置是否完整
   */
  IsConfigValid(): boolean {
    return super.IsConfigValid() && hasAllKeys(this.config, requiredConfig);
  }

  /**
   * 發送日誌訊息至 Slack
   */
  async Log(
    level: LogLevel,
    message: LogMessageInterface,
    label: string,
    logTime: number
  ): Promise<void> {
    if (!this.slackClient) {
      this.slackClient = new WebClient(this.config.slackToken);
    }

    const { project, environment, slackChannel, options } = this.config;
    const { fields, getFooter } = options || {};
    const { maxLine, short = false, excludes = [] } = fields || {};

    const fieldsExcludes = ['message'].concat(excludes);
    const logMessageFields = message.toObject();

    // 設定訊息底部的頁尾文字
    const footer = getFooter
      ? getFooter(logMessageFields, logTime)
      : `${project} - ${environment} - ${label}`;

    // 建立 Slack Attachment 結構
    const messageOpts = {
      channel: slackChannel,
      text: `[${formatLogLevel(level).toUpperCase()}] ${message.get('message')}`,
      attachments: [
        {
          color: formatLogLevelSlackColor(level),
          title: `[${formatLogLevel(level).toUpperCase()}] ${message.get('message')}`,
          fields: Object.keys(logMessageFields)
            .filter(key => !fieldsExcludes.includes(key))
            .map(key => ({
              title: key,
              value: formatMessage(logMessageFields[key], maxLine),
              short,
            })),
          footer,
        },
      ],
    };

    try {
      const result = await this.slackClient.chat.postMessage(messageOpts);
      if (!result.ok) {
        console.error(`Slack logging failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending message to Slack:', error);
    }
  }
}

export default SlackLogger;

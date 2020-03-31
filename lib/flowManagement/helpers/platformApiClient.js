const { BasicAuthRestClient } = require('@elastic.io/component-commons-library');
const removeTrailingSlash = require('remove-trailing-slash');

async function sleep(amount) { await new Promise((r) => setTimeout(r, amount)); }

module.exports = class PlatformApiClient extends BasicAuthRestClient {
  constructor(emitter, cfg) {
    super(emitter, cfg);
    this.cfg.resourceServerUrl = `${removeTrailingSlash(this.cfg.resourceServerUrl.trim())}/v2`;
  }

  async fetchAllFlowsFromWorkspace(workspaceId, options = {}) {
    const {
      flowsPerPage = 50,
    } = options;

    const flows = [];
    const flowCountResponse = await this.makeRequest({
      url: `/flows?workspace_id=${workspaceId}&page[size]=1`,
      method: 'GET',
    });

    const flowCount = flowCountResponse.meta.total;
    const numPages = Math.ceil(flowCount / flowsPerPage);
    const pageRange = Array.from({ length: numPages }, (x, i) => i + 1);
    await Promise.all(pageRange.map(async (pageNumber) => {
      const pageResult = await this.makeRequest({
        url: `/flows?workspace_id=${workspaceId}&page[size]=${flowsPerPage}&page[number]=${pageNumber}`,
        method: 'GET',
      });
      const flowArray = pageResult.data;
      flows.push(...flowArray);
    }));

    return flows;
  }

  /* eslint-disable no-await-in-loop */
  async changeFlowState(options) {
    const {
      timeout = 90000,
      pollInterval = 1000,
      action,
      desiredStatus,
      flowId,
    } = options;
    const timeoutTime = Date.now() + timeout;

    // Make sure flow is not changing states
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (Date.now() > timeoutTime) {
        throw new Error(`Timeout in waiting for flow ${flowId} to ${action}`);
      }

      const flow = await this.makeRequest({
        method: 'GET',
        url: `/flows/${flowId}`,
      });
      if (flow.data.attributes.current_status === flow.data.attributes.status) {
        break;
      }
      await sleep(pollInterval);
    }

    await this.makeRequest({
      method: 'POST',
      url: `/flows/${flowId}/${action}`,
    });

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (Date.now() > timeoutTime) {
        throw new Error(`Timeout in waiting for flow ${flowId} to ${action}`);
      }
      const flow = await this.makeRequest({
        method: 'GET',
        url: `/flows/${flowId}`,
      });
      if (flow.data.attributes.current_status === desiredStatus) {
        break;
      }
      await sleep(pollInterval);
    }
  }
  /* eslint-enable no-await-in-loop */

  async startFlow(flowId, options = {}) {
    return this.changeFlowState({
      ...options,
      action: 'start',
      desiredStatus: 'active',
      flowId,
    });
  }

  async stopFlow(flowId, options = {}) {
    return this.changeFlowState({
      ...options,
      action: 'stop',
      desiredStatus: 'inactive',
      flowId,
    });
  }
};

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const utils = require('../../lib/component/helpers/utils');
const { print } = require('../../lib/component/helpers/log');

const COMPONENT_PATH = path.resolve(__dirname, './temp-test-component');

const fixture = {
  cfg: {},
  msg: {
    body: {
      fireTime: '2020-02-11T14:52:01.947Z',
      lastPoll: '1970-01-01T00:00:00.000Z',
    },
  },
};

const schema = {
  type: 'object',
  properties: {
    fireTime: {
      type: 'string',
      format: 'date-time',
      required: true,
    },
    lastPoll: {
      type: 'string',
      format: 'date-time',
      required: true,
    },
  },
};

describe('Tests for Component Metadata Validity', () => {
  let componentJson;
  beforeEach(() => {
    Object.keys(print).forEach((method) => {
      sinon.stub(print, method).callsFake((msg) => msg);
    });
    if (!fs.existsSync(COMPONENT_PATH)) {
      fs.mkdirSync(COMPONENT_PATH);
    }
    componentJson = {
      triggers: {
        triggerName: {},
      },
      actions: {
        actionName: {},
      },
    };
  });

  afterEach(() => {
    Object.keys(print).forEach((method) => {
      print[method].restore();
    });
    fs.rmdirSync(COMPONENT_PATH, { recursive: true });
  });

  function writeComponentJson() {
    fs.writeFileSync(path.join(COMPONENT_PATH, './component.json'), JSON.stringify(componentJson));
  }

  [{
    actionOrTrigger: 'triggers',
    name: 'triggerName',
  }, {
    actionOrTrigger: 'actions',
    name: 'actionName',
  }].forEach((actionOrTrigger) => {
    it(`Metadata for ${actionOrTrigger.actionOrTrigger}: Dynamic metadata`, () => {
      componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].dynamicMetadata = true;
      writeComponentJson();

      utils.validateFixture(COMPONENT_PATH, fixture, actionOrTrigger.name);

      const errors = print.error.getCalls().map((c) => c.lastArg);
      const warnings = print.warn.getCalls().map((c) => c.lastArg);
      const info = print.info.getCalls().map((c) => c.lastArg);

      expect(errors.length).to.be.equal(0);
      expect(warnings.length).to.be.equal(0);
      expect(info).to.include(`Dynamic schema for ${actionOrTrigger.name}; not performing any schema validation`);
    });

    it(`Metadata for ${actionOrTrigger.actionOrTrigger}: Dynamic metadata with metadata`, () => {
      componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].dynamicMetadata = true;
      componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata = {};
      writeComponentJson();

      utils.validateFixture(COMPONENT_PATH, fixture, actionOrTrigger.name);

      const errors = print.error.getCalls().map((c) => c.lastArg);
      const warnings = print.warn.getCalls().map((c) => c.lastArg);
      const info = print.info.getCalls().map((c) => c.lastArg);

      expect(errors.length).to.be.equal(0);
      expect(warnings).to.include(`Metadata provided for ${actionOrTrigger.name} even though it has dynamic schema.  This will be ignored and should be removed.`);
      expect(info).to.include(`Dynamic schema for ${actionOrTrigger.name}; not performing any schema validation`);
    });

    [undefined, {}].forEach((metadataValue) => {
      it(`Metadata for ${actionOrTrigger.actionOrTrigger}: ${JSON.stringify(metadataValue)}`, () => {
        if (metadataValue !== undefined) {
          // eslint-disable-next-line max-len
          componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata = metadataValue;
        }
        writeComponentJson();

        utils.validateFixture(COMPONENT_PATH, fixture, actionOrTrigger.name);

        const errors = print.error.getCalls().map((c) => c.lastArg);
        const warnings = print.warn.getCalls().map((c) => c.lastArg);
        const info = print.info.getCalls().map((c) => c.lastArg);

        expect(errors.length).to.be.equal(0);
        expect(warnings).to.include(`${actionOrTrigger.name} does not have out metadata.  It will not be possible to auto-generate samples for this action/trigger.`);
        if (actionOrTrigger === 'actions') {
          expect(warnings).to.include(`${actionOrTrigger.name} does not have in metadata.  This means that there will be no mapping step before this action.  This may not be what you want.`);
        }
        expect(info).to.include(`No in schema for ${actionOrTrigger.name}; not performing any schema validation`);
      });
    });

    [null, true, false, 5.5, [], 'hello'].forEach((metadataValue) => {
      it(`Metadata for ${actionOrTrigger.actionOrTrigger}: ${JSON.stringify(metadataValue)}`, () => {
        // eslint-disable-next-line max-len
        componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata = metadataValue;
        writeComponentJson();

        expect(utils.validateFixture.bind({}, COMPONENT_PATH, fixture, actionOrTrigger.name))
          .to.throw();

        const errors = print.error.getCalls().map((c) => c.lastArg);

        expect(errors).to.include(`Metadata needs to be an JSON object (or undefined) for ${actionOrTrigger.name}`);
      });
    });

    it(`Metadata for ${actionOrTrigger.actionOrTrigger}: Extra Metadata Keys`, () => {
      componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata = {
        foo: 'bar',
        bar: 'baz',
        in: {},
        out: {},
      };
      writeComponentJson();

      utils.validateFixture(COMPONENT_PATH, fixture, actionOrTrigger.name);

      const warnings = print.warn.getCalls().map((c) => c.lastArg);

      expect(warnings).to.include(`The metadata object for ${actionOrTrigger.name} should only contain "in" and "out".   Not: foo, bar`);
    });

    ['in', 'out'].forEach((inOrOut) => {
      it(`Metadata for ${actionOrTrigger.actionOrTrigger} ${inOrOut}: Plain Object`, () => {
        componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata = {};
        componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata[inOrOut] = {};
        writeComponentJson();

        utils.validateFixture(COMPONENT_PATH, fixture, actionOrTrigger.name);

        const errors = print.error.getCalls().map((c) => c.lastArg);
        const warnings = print.warn.getCalls().map((c) => c.lastArg);
        const info = print.info.getCalls().map((c) => c.lastArg);

        expect(errors.length).to.be.equal(0);
        expect(warnings).to.include(`${actionOrTrigger.name} does not have out metadata.  It will not be possible to auto-generate samples for this action/trigger.`);
        if (actionOrTrigger === 'actions') {
          expect(warnings).to.include(`${actionOrTrigger.name} does not have in metadata.  This means that there will be no mapping step before this action.  This may not be what you want.`);
        }
        expect(info).to.include(`No in schema for ${actionOrTrigger.name}; not performing any schema validation`);
      });

      [null, true, false, 5.5, []].forEach((metadataValue) => {
        it(`Metadata for ${actionOrTrigger.actionOrTrigger}  ${inOrOut}: ${JSON.stringify(metadataValue)}`, () => {
          componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata = {};
          // eslint-disable-next-line max-len
          componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata[inOrOut] = metadataValue;
          writeComponentJson();

          expect(utils.validateFixture.bind({}, COMPONENT_PATH, fixture, actionOrTrigger.name))
            .to.throw();

          const errors = print.error.getCalls().map((c) => c.lastArg);

          expect(errors).to.include(`Metadata in & out for ${actionOrTrigger.name} need to be either undefined, plain objects or strings that point to files with plain objects.`);
        });
      });

      it(`Metadata for ${actionOrTrigger.actionOrTrigger}  ${inOrOut}: Invalid File`, () => {
        componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata = {};
        componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata[inOrOut] = './schema.file';
        writeComponentJson();

        expect(utils.validateFixture.bind({}, COMPONENT_PATH, fixture, actionOrTrigger.name))
          .to.throw();

        const errors = print.error.getCalls().map((c) => c.lastArg);

        expect(errors).to.include('Schema file ./schema.file missing');
      });

      it(`Metadata for ${actionOrTrigger.actionOrTrigger}  ${inOrOut}: Non-JSON File`, () => {
        componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata = {};
        componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata[inOrOut] = './schema.file';
        fs.writeFileSync(path.join(COMPONENT_PATH, './schema.file'), 'foo');
        writeComponentJson();

        expect(utils.validateFixture.bind({}, COMPONENT_PATH, fixture, actionOrTrigger.name))
          .to.throw();

        const errors = print.error.getCalls().map((c) => c.lastArg);

        expect(errors).to.include('Schema file ./schema.file appears not to be valid JSON.');
      });

      it(`Metadata for ${actionOrTrigger.actionOrTrigger}  ${inOrOut}: Non-Object File`, () => {
        componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata = {};
        componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata[inOrOut] = './schema.file';
        fs.writeFileSync(path.join(COMPONENT_PATH, './schema.file'), '["abc"]');
        writeComponentJson();

        expect(utils.validateFixture.bind({}, COMPONENT_PATH, fixture, actionOrTrigger.name))
          .to.throw();

        const errors = print.error.getCalls().map((c) => c.lastArg);

        expect(errors).to.include('Metadata in ./schema.file needs to be a plain JSON object.');
      });
    });

    it(`Metadata for ${actionOrTrigger.actionOrTrigger}: Inline`, () => {
      componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata = {};
      componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata.in = schema;
      componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata.out = schema;
      writeComponentJson();

      utils.validateFixture(COMPONENT_PATH, fixture, actionOrTrigger.name);

      const errors = print.error.getCalls().map((c) => c.lastArg);
      const warnings = print.warn.getCalls().map((c) => c.lastArg);
      const info = print.info.getCalls().map((c) => c.lastArg);

      expect(errors.length).to.be.equal(0);
      expect(warnings.length).to.be.equal(0);
      expect(info).to.include('Fixture successfully validated against schema');
    });

    it(`Metadata for ${actionOrTrigger.actionOrTrigger}: Valid Schema File`, () => {
      componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata = {};
      componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata.in = './schema.file';
      componentJson[actionOrTrigger.actionOrTrigger][actionOrTrigger.name].metadata.out = './schema.file';
      fs.writeFileSync(path.join(COMPONENT_PATH, './schema.file'), JSON.stringify(schema));
      writeComponentJson();

      utils.validateFixture(COMPONENT_PATH, fixture, actionOrTrigger.name);

      const errors = print.error.getCalls().map((c) => c.lastArg);
      const warnings = print.warn.getCalls().map((c) => c.lastArg);
      const info = print.info.getCalls().map((c) => c.lastArg);

      expect(errors.length).to.be.equal(0);
      expect(warnings.length).to.be.equal(0);
      expect(info).to.include('Fixture successfully validated against schema');
    });
  });
});

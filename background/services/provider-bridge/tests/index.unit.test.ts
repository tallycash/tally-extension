import {
  EIP1193Error,
  EIP1193_ERROR_CODES,
  PermissionRequest,
} from "@tallyho/provider-bridge-shared"
import sinon from "sinon"
import browser from "webextension-polyfill"
import { createProviderBridgeService } from "../../../tests/factories"
import ProviderBridgeService from "../index"

const WINDOW = {
  focused: true,
  incognito: false,
  alwaysOnTop: true,
}

const CHAIN_ID = "1"
const ADDRESS = "0x0000000000000000000000000000000000000000"

const BASE_DATA = {
  enablingPermission: {
    key: `https://app.test_${"0x0000000000000000000000000000000000000000"}_${CHAIN_ID}`,
    origin: "https://app.test",
    faviconUrl: "https://app.test/favicon.png",
    title: "Test",
    state: "allow",
    accountAddress: ADDRESS,
    chainID: CHAIN_ID,
  } as PermissionRequest,
  origin: "https://app.test",
}

const PARAMS = {
  eth_accounts: ["Test", "https://app.test/favicon.png"],
  eth_sendTransaction: [
    {
      from: ADDRESS,
      data: Date.now().toString(),
      gasPrice: "0xf4240",
      to: "0x1111111111111111111111111111111111111111",
    },
  ],
}
describe("ProviderBridgeService", () => {
  let providerBridgeService: ProviderBridgeService
  const sandbox = sinon.createSandbox()

  beforeEach(async () => {
    browser.windows.getCurrent = jest.fn(() => Promise.resolve(WINDOW))
    browser.windows.create = jest.fn(() => Promise.resolve(WINDOW))
    providerBridgeService = await createProviderBridgeService()
    await providerBridgeService.startService()
    sandbox.restore()
  })

  afterEach(async () => {
    await providerBridgeService.stopService()
    jest.clearAllMocks()
  })

  describe("routeContentScriptRPCRequest", () => {
    it("eth_accounts should return the account address owned by the client", async () => {
      const { enablingPermission, origin } = BASE_DATA
      const method = "eth_accounts"
      const params = PARAMS[method]

      const response = await providerBridgeService.routeContentScriptRPCRequest(
        enablingPermission,
        method,
        params,
        origin
      )
      expect(response).toEqual([enablingPermission.accountAddress])
    })

    it("eth_sendTransaction should call routeSafeRequest when a user has permission to sign", async () => {
      const { enablingPermission, origin } = BASE_DATA
      const method = "eth_sendTransaction"
      const params = PARAMS[method]
      const stub = sandbox.stub(providerBridgeService, "routeSafeRequest")

      await providerBridgeService.routeContentScriptRPCRequest(
        enablingPermission,
        method,
        params,
        origin
      )

      expect(stub.called).toBe(true)
    })

    it("eth_sendTransaction should not call routeSafeRequest when a user has not permission to sign", async () => {
      const { enablingPermission, origin } = BASE_DATA
      const method = "eth_sendTransaction"
      const params = PARAMS[method]
      const stub = sandbox.stub(providerBridgeService, "routeSafeRequest")

      const response = await providerBridgeService.routeContentScriptRPCRequest(
        { ...enablingPermission, state: "deny" },
        method,
        params,
        origin
      )

      expect(stub.called).toBe(false)
      expect(response).toBe(EIP1193_ERROR_CODES.unauthorized)
    })

    it("should correctly handle a provider Rpc error", async () => {
      const { enablingPermission, origin } = BASE_DATA
      const method = "eth_sendTransaction"
      const params = PARAMS[method]
      const stub = sandbox
        .stub(providerBridgeService, "routeSafeRequest")
        .callsFake(async () => {
          throw new EIP1193Error(EIP1193_ERROR_CODES.disconnected)
        })
      const response = await providerBridgeService.routeContentScriptRPCRequest(
        enablingPermission,
        method,
        params,
        origin
      )

      expect(stub.callCount).toBe(1)
      expect(response).toBe(EIP1193_ERROR_CODES.disconnected)
    })

    it("should correctly handle a custom error when a message is in the body", async () => {
      const error = {
        body: JSON.stringify({
          error: {
            message: "Custom error",
          },
        }),
      }
      const { enablingPermission, origin } = BASE_DATA
      const method = "eth_sendTransaction"
      const params = PARAMS[method]
      const stub = sandbox
        .stub(providerBridgeService, "routeSafeRequest")
        .callsFake(async () => {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw error
        })
      const response = await providerBridgeService.routeContentScriptRPCRequest(
        enablingPermission,
        method,
        params,
        origin
      )

      expect(stub.callCount).toBe(1)
      expect(response).toStrictEqual({ code: 4001, message: "Custom error" })
    })

    it("should correctly handle a custom error when a message is in the body", async () => {
      const error = {
        body: JSON.stringify({
          error: {
            message: "Custom error",
          },
        }),
      }
      const { enablingPermission, origin } = BASE_DATA
      const method = "eth_sendTransaction"
      const params = PARAMS[method]
      const stub = sandbox
        .stub(providerBridgeService, "routeSafeRequest")
        .callsFake(async () => {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw error
        })
      const response = await providerBridgeService.routeContentScriptRPCRequest(
        enablingPermission,
        method,
        params,
        origin
      )

      expect(stub.callCount).toBe(1)
      expect(response).toStrictEqual({ code: 4001, message: "Custom error" })
    })

    it("should correctly handle a custom error when a message is nested", async () => {
      const error = {
        error: {
          body: JSON.stringify({
            error: {
              message: "Custom error",
            },
          }),
        },
      }
      const { enablingPermission, origin } = BASE_DATA
      const method = "eth_sendTransaction"
      const params = PARAMS[method]
      const stub = sandbox
        .stub(providerBridgeService, "routeSafeRequest")
        .callsFake(async () => {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw error
        })
      const response = await providerBridgeService.routeContentScriptRPCRequest(
        enablingPermission,
        method,
        params,
        origin
      )

      expect(stub.callCount).toBe(1)
      expect(response).toStrictEqual({ code: 4001, message: "Custom error" })
    })
  })
})

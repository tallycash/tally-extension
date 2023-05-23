import React, { ReactElement } from "react"
import { SmartContractFungibleAsset } from "@tallyho/tally-background/assets"
import { useTranslation } from "react-i18next"
import { updateAssetTrustStatus } from "@tallyho/tally-background/redux-slices/assets"
import { truncateAddress } from "@tallyho/tally-background/lib/utils"
import { selectCurrentNetwork } from "@tallyho/tally-background/redux-slices/selectors"
import classNames from "classnames"
import { isUntrustedAsset } from "@tallyho/tally-background/redux-slices/utils/asset-utils"
import SharedSlideUpMenu from "../../Shared/SharedSlideUpMenu"
import SharedButton from "../../Shared/SharedButton"
import { useBackgroundDispatch, useBackgroundSelector } from "../../../hooks"
import SharedSlideUpMenuPanel from "../../Shared/SharedSlideUpMenuPanel"
import SharedIcon from "../../Shared/SharedIcon"
import UntrustedAssetBanner from "./UntrustedAssetBanner"
import { getBlockExplorerURL } from "../../../utils/networks"

type AssetWarningSlideUpProps = {
  asset: SmartContractFungibleAsset
  close: () => void
}

export default function AssetWarningSlideUp(
  props: AssetWarningSlideUpProps
): ReactElement {
  const { t } = useTranslation("translation", {
    keyPrefix: "wallet.trustedAssets",
  })

  const { asset, close } = props

  const dispatch = useBackgroundDispatch()

  const network = useBackgroundSelector(selectCurrentNetwork)

  const setAssetTrustStatus = async (isTrusted: boolean) => {
    await dispatch(updateAssetTrustStatus({ asset, trusted: isTrusted }))
    close()
  }

  const isUntrusted = isUntrustedAsset(asset)

  const contractAddress =
    asset && "contractAddress" in asset && asset.contractAddress
      ? asset.contractAddress
      : ""

  const discoveryTxHash = asset.metadata?.discoveryTxHash

  const blockExplorerUrl = getBlockExplorerURL(network)

  return (
    <SharedSlideUpMenu
      isOpen={asset !== null}
      size="custom"
      customSize="350"
      close={close}
    >
      <SharedSlideUpMenuPanel header={t("assetImported")}>
        <div className="content">
          <div>
            <UntrustedAssetBanner
              title={t("banner.title")}
              description={t("banner.description")}
            />
            <ul className="asset_details">
              <li className="asset_symbol">
                <div className="left">{t("symbol")}</div>
                <div className="right ellipsis">{`${asset?.symbol}`}</div>
              </li>
              <li>
                <div className="left">{t("contract")}</div>
                <div className="right">
                  <button
                    type="button"
                    className={classNames("address_button", {
                      no_click: !blockExplorerUrl,
                    })}
                    disabled={!blockExplorerUrl}
                    onClick={() =>
                      window
                        .open(
                          `${blockExplorerUrl}/token/${contractAddress}`,
                          "_blank"
                        )
                        ?.focus()
                    }
                  >
                    {truncateAddress(contractAddress)}
                    {blockExplorerUrl && (
                      <SharedIcon
                        width={16}
                        icon="icons/s/new-tab.svg"
                        color="var(--green-5)"
                        hoverColor="var(--trophy-gold)"
                        transitionHoverTime="0.2s"
                      />
                    )}
                  </button>
                </div>
              </li>
              {discoveryTxHash && (
                <li>
                  <div className="left">{t("discoveryTxHash")}</div>
                  <div className="right">
                    <button
                      type="button"
                      className={classNames("address_button", {
                        no_click: !blockExplorerUrl,
                      })}
                      onClick={() =>
                        window
                          .open(
                            `${blockExplorerUrl}/tx/${discoveryTxHash}`,
                            "_blank"
                          )
                          ?.focus()
                      }
                      title={discoveryTxHash}
                    >
                      {truncateAddress(discoveryTxHash)}
                    </button>
                  </div>
                </li>
              )}
            </ul>
          </div>
          <div>
            <div className="asset_trust_actions">
              <SharedButton size="medium" type="secondary" onClick={close}>
                {t("dontShow")}
              </SharedButton>
              {isUntrusted && (
                <SharedButton
                  size="medium"
                  type="primary"
                  onClick={() => setAssetTrustStatus(true)}
                >
                  {t("addToAssetList")}
                </SharedButton>
              )}
            </div>
          </div>
        </div>
      </SharedSlideUpMenuPanel>
      <style jsx>{`
        .content {
          padding: 0 16px 16px 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 271px;
        }
        ul.asset_details {
          display: block;
          margin-top: 16px;

          font-family: "Segment";
          font-style: normal;
          font-weight: 500;
          font-size: 16px;
          line-height: 24px;
        }
        ul.asset_details > li {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .left {
          color: var(--green-20);
        }
        .right {
          color: var(--green-5);
          width: 50%;
          text-align: right;
        }
        .asset_trust_actions {
          display: flex;
          justify-content: space-between;
        }
        .address_button {
          display: flex;
          align-items: center;
          justify-content: end;
          width: 100%;
          gap: 4px;
          transition: color 0.2s;
        }
        .address_button:hover {
          color: var(--trophy-gold);
        }
        .address_button .no_click {
          pointer-events: none;
        }
      `}</style>
      <style global jsx>
        {`
          .address_button:hover .icon {
            background-color: var(--trophy-gold);
          }
        `}
      </style>
    </SharedSlideUpMenu>
  )
}
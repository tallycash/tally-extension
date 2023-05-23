import React, { ReactElement } from "react"
import SharedIcon from "../../Shared/SharedIcon"

export default function AssetTrustToggler({
  text,
  color,
  icon,
  hoverColor,
  onClick,
}: {
  text: string
  color: string
  icon: string
  hoverColor?: string
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}): ReactElement {
  return (
    <button type="button" onClick={onClick} className="asset_trust_toggler">
      <span className="text">{text} </span>
      <SharedIcon
        icon={`/icons/m/${icon}.svg`}
        width={24}
        hoverColor={hoverColor}
        color={color}
        transitionHoverTime="0.2s"
      />
      <style jsx>{`
        .asset_trust_toggler {
          color: ${color};
          align-items: center;
          display: flex;
          gap: 4px;
          transition: color 0.2s;
        }
        .asset_trust_toggler:hover {
          color: ${hoverColor};
        }
        .text {
          font-size: 16px;
          font-weight: 500;
          line-height: 24px;
          letter-spacing: 0em;
          text-align: left;
        }
      `}</style>
      <style global jsx>
        {`
          .asset_trust_toggler:hover .icon {
            color: ${hoverColor};
          }
        `}
      </style>
    </button>
  )
}
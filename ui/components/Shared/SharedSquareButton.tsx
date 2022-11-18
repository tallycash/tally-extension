import React, { ReactElement, useState } from "react"
import { Redirect } from "react-router-dom"
import { History } from "history"

const SIZE = 32
const DEFAULT_COLORS: ColorDetails = {
  color: "var(--green-40)",
  hoverColor: "var(--trophy-gold)",
}

type ColorDetails = {
  color: string
  hoverColor: string
}

type Props = {
  icon: string
  iconColor: ColorDetails
  textColor: ColorDetails
  ariaLabel?: string
  children: React.ReactNode
  linkTo?: History.LocationDescriptor<unknown>
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function SharedSquareButton(props: Props): ReactElement {
  const { icon, iconColor, textColor, ariaLabel, children, linkTo, onClick } =
    props
  const [navigateTo, setNavigateTo] = useState<
    History.LocationDescriptor<unknown> | undefined
  >(undefined)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (linkTo) {
      setNavigateTo(linkTo)
    }
  }

  if (navigateTo && navigateTo === linkTo) {
    return <Redirect push to={linkTo} />
  }

  return (
    <button type="button" aria-label={ariaLabel} onClick={handleClick}>
      <div className="content_wrap">
        <div className="icon_wrap">
          <div className="icon" />
        </div>
        <div className="text">{children}</div>
      </div>
      <style jsx>
        {`
          button {
            font-size: 12px;
            font-weight: 500;
            line-height: 16px;
            letter-spacing: 0.03em;
            color: ${textColor.color};
            transition: color 0.2s;
          }
          button:hover {
            color: ${textColor.hoverColor};
          }
          .content_wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }
          .icon_wrap {
            border-radius: 12px;
            width: ${SIZE}px;
            height: ${SIZE}px;
            background-color: ${iconColor.color};
            transition: background-color 0.2s;
          }
          button:hover .icon_wrap {
            background-color: ${iconColor.hoverColor};
          }
          .icon {
            mask-image: url("./images/${icon}");
            mask-repeat: no-repeat;
            mask-position: center;
            mask-size: cover;
            mask-size: 60%;
            width: ${SIZE}px;
            height: ${SIZE}px;
            background-color: var(--hunter-green);
          }
        `}
      </style>
    </button>
  )
}

SharedSquareButton.defaultProps = {
  iconColor: DEFAULT_COLORS,
  textColor: DEFAULT_COLORS,
}
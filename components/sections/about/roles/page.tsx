import React from 'react'

export interface Props {
  role: string
}

export default function Roles(props: Props) {
  const role = props.role
  if (!role) {
    return
  }

  switch (role) {
    default:
      return (
        <div>i havent made this page yet lol (please check other sections)</div>
      )

    case "roblox":
      return (
        <div></div>
      )
  }
}

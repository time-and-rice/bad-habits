import classNames from "classnames";
import type { PropsWithChildren, ReactNode } from "react";
import { FaBars, FaEllipsisV } from "react-icons/fa";
import { Link } from "react-router-dom";

export function DotMenu(props: PropsWithChildren) {
  return (
    <ButtonMenu icon={<FaEllipsisV />} size="xs">
      {props.children}
    </ButtonMenu>
  );
}

export function BarMenu(props: PropsWithChildren) {
  return (
    <ButtonMenu icon={<FaBars />} size="md">
      {props.children}
    </ButtonMenu>
  );
}

type ButtonMenuProps = PropsWithChildren<{
  icon: ReactNode;
  size?: "xs" | "sm" | "md";
}>;

function ButtonMenu(props: ButtonMenuProps) {
  const btnSize = { xs: "btn-xs", sm: "btn-sm", md: "btn-md" }[
    props.size ?? "md"
  ];

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className={classNames("btn btn-ghost m-1", btnSize)}>
        {props.icon}
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu w-52 p-2 border rounded-box shadow bg-base-100"
      >
        {props.children}
      </ul>
    </div>
  );
}

type MenuItemProps = PropsWithChildren<{ to?: string; onClick?: () => void }>;

export function MenuItem(props: MenuItemProps) {
  return (
    <li>
      <Link
        className="block"
        to={props.to ?? "#"}
        onClick={(e) => {
          if (props.onClick) {
            e.preventDefault();
            props.onClick();
          }
          setTimeout(() => (e.target as HTMLElement).blur(), 0);
        }}
      >
        {props.children}
      </Link>
    </li>
  );
}

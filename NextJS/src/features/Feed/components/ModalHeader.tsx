import React from "react";
import SmallProfileImage from "@/shared/components/SmallProfileImage";
import NameWithVerIcon from "./NameWithVerIcon";
import { Cloud } from "@/shared/icons";
import { formatTimeAgo } from "../utils/calculateTimeAgo";
import { FollowUnfollow } from "@/features/FollowUnfollow";

export default function ModalHeader({ user, theme }: Readonly<{ user: any; theme: string }>) {
  if (!user) return null;
  return (
    <div className="flex sticky items-center justify-between p-4 w-full shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-gray-400 dark:bg-gray-600">
          <SmallProfileImage image={user.dp} />
        </div>
        <div className="flex flex-col">
          <NameWithVerIcon
            name={user.name}
            isVarified={user.verification?.status === "Verified"}
          />
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Cloud fillColor={theme === "dark" ? "white" : "black"} />
            <p>{formatTimeAgo(user.createdAt)}</p>
          </div>
        </div>
      </div>
      <FollowUnfollow
        id={user._id ?? ""}
        showButtonTextOnly
        visibleAfterFollow={false}
      />
    </div>
  );
}

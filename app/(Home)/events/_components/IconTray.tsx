import React from "react";
import CustomIcon from "@/app/components/CustomIcon";
import Link from "next/link";
interface IconTrayProps {
  iconList: {
    id: string;
    url: string;
    name: string;
    icon: string;
  }[];
  isLink?: boolean;
}

const IconTray = ({ iconList, isLink = false }: IconTrayProps) => {
  return (
    <div>
      {isLink ? (
        <div className="flex gap-x-4">
          {iconList.map((icon) => (
            <Link
              href={icon.url}
              key={icon.id}
              className="hover:text-[#EFB9A2] hover:scale-110 hover:shadow-md transition-all"
            >
              <CustomIcon src={icon.icon} height={30} width={30} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex gap-x-4">
          {iconList.map((icon) => (
            <CustomIcon key={icon.id} src={icon.icon} height={30} width={30} />
          ))}
        </div>
      )}
    </div>
  );
};

export default IconTray;

import Link from "next/link";
import React from "react";

const LinkGlobal = ({link, text}) => {
  return (
    <Link
      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded mt-3"
      href="{link}"
    >
      {text}
    </Link>
  );
};

export default LinkGlobal;

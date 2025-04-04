import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Link } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/", current: false },
  { name: "Probe Statistics", href: "/table", current: false },
  { name: "File Count", href: "/file-count", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  return (
    <Disclosure
      as="nav"
      className="bg-[#c0262e] h-full fixed inset-y-0 left-0 w-64"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center p-4">
          <div className="flex shrink-0 items-center justify-center">
            <img
              alt="Vehere"
              src="vehere_logo.jpg"
              className="h-16 w-auto rounded-4xl"
            />
          </div>
        </div>

        <div className="flex flex-col flex-1 space-y-2 px-2 pt-2 pb-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={classNames(
                item.current
                  ? "bg-[#8E1B28] text-white" // Darker shade for active state
                  : "text-white hover:bg-[#9E2A31] hover:text-white", // Lighter shade for hover state
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              to={item.href}
              className={classNames(
                item.current
                  ? "bg-[#8E1B28] text-white"
                  : "text-gray-300 hover:bg-[#9E2A31] hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}

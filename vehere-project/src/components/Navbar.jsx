import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Link } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/dashboard", current: false },
  { name: "Probe Statistics", href: "/table", current: false },
  { name: "Probe File Count", href: "/file-count", current: false },
  { name: "Logstash File Count", href: "/logstash-file-count", current: false },
  { name: "Services", href: "/services", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  return (
    <Disclosure
      as="nav"
      className="bg-[#c0262e] h-screen fixed inset-y-0 left-0 w-[clamp(4rem,16vw,16rem)] min-w-[4rem] transition-all duration-300 overflow-hidden"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center p-[clamp(0.5rem,1.5vw,1.5rem)]">
          <img
            alt="Vehere"
            src="vehere_logo.jpg"
            className="h-[clamp(2rem,6vw,4rem)] w-auto rounded-3xl"
          />
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col flex-1 space-y-2 px-[clamp(0.5rem,1vw,1rem)] pt-2 pb-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={classNames(
                item.current
                  ? "bg-[#8E1B28] text-white"
                  : "text-white hover:bg-[#9E2A31] hover:text-white",
                "block rounded-md px-3 py-[clamp(0.25rem,0.7vw,0.5rem)] text-[clamp(0.6rem,1vw,1rem)] font-medium truncate"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Optional mobile panel */}
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

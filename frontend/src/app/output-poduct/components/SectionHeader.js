"use client";

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 text-lg font-semibold">
    <Icon className="h-5 w-5 text-primary" />
    <span>{title}</span>
  </div>
);

export default SectionHeader;

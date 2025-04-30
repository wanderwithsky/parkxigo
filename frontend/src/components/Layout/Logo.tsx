import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="512" height="512" rx="100" fill="currentColor" fillOpacity="0.1" />
      <path
        d="M405.333 170.667C405.333 153.92 391.747 140.333 375 140.333H136.667C119.92 140.333 106.333 153.92 106.333 170.667V341.333C106.333 358.08 119.92 371.667 136.667 371.667H375C391.747 371.667 405.333 358.08 405.333 341.333V170.667Z"
        stroke="currentColor"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M156.333 310.667C173.081 310.667 186.667 297.081 186.667 280.333C186.667 263.586 173.081 250 156.333 250C139.586 250 126 263.586 126 280.333C126 297.081 139.586 310.667 156.333 310.667Z"
        fill="currentColor"
      />
      <path
        d="M355.667 310.667C372.414 310.667 386 297.081 386 280.333C386 263.586 372.414 250 355.667 250C338.919 250 325.333 263.586 325.333 280.333C325.333 297.081 338.919 310.667 355.667 310.667Z"
        fill="currentColor"
      />
      <path
        d="M186.667 280.333H325.333"
        stroke="currentColor"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M156.333 250V201.667C156.333 193.293 159.786 185.287 166.123 179.472C172.46 173.657 181.095 170.667 190.121 170.667H321.879C330.905 170.667 339.54 173.657 345.877 179.472C352.214 185.287 355.667 193.293 355.667 201.667V250"
        stroke="currentColor"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
} 

import React from 'react';

const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.355a7.5 7.5 0 0 1-3 0m3 0a7.5 7.5 0 0 0-3 0m.375 0a9.753 9.753 0 0 1-2.625.097M6.375 12c0-3.182 2.065-5.849 5.093-6.652M12 3.75c2.392 0 4.512.724 6.136 1.932M12 3.75c-2.392 0-4.512.724-6.136 1.932" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0Z" />
  </svg>
);

export default LightBulbIcon;

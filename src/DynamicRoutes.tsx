import React, { Suspense } from "react";
const modules = import.meta.glob("/src/pages/**/*.tsx");

interface Props {
  path: string;
}

const DynamicRoute: React.FC<Props> = ({ path }) => {
  const parts = path.split("/").filter(Boolean);

  if (parts.length !== 3) {
    return <div>Invalid Route</div>;
  }

  const [module, folder, page] = parts;

const componentPath =
  `/src/pages/${module.charAt(0).toUpperCase() + module.slice(1)}` +
  `/${folder.charAt(0).toUpperCase() + folder.slice(1)}` +
  `/${page}.tsx`;
  
  const importer = modules[componentPath];
  
console.log("Current Path:", path);
console.log("Component Path:", componentPath);
console.log("Importer Found:", !!modules[componentPath]);
  if (!importer) {
    return <div>Page "{page}" not found</div>;
  }

  const Component = React.lazy(importer as any);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
};

export default DynamicRoute;
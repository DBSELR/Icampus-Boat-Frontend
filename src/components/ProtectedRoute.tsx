import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";

interface Props extends RouteProps {
  component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<Props> = ({
  component: Component,
  ...rest
}) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  
  // Check if user is authenticated
  const isAuthenticated = !!token || !!user?.userGroup;
  
  if (!isAuthenticated) {
    return <Route {...rest} render={() => <Redirect to="/login" />} />;
  }

  const forms = user?.forms || [];

  // Allow route if forms array is not configured yet or if path matches
  const allowed = forms.length === 0 || forms.some(
    (x: any) =>
      x?.url?.toLowerCase() === String(rest.path).toLowerCase() ||
      x?.route?.toLowerCase() === String(rest.path).toLowerCase()
  );

  return (
    <Route
      {...rest}
      render={(props) =>
        allowed ? <Component {...props} /> : <Redirect to="/home" />
      }
    />
  );
};

export default ProtectedRoute;
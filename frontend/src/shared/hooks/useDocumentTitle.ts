import { useEffect } from "react";

export const useDocumentTitle = (pageName: string): void => {
  useEffect(() => {
    document.title = `${pageName} - Chiga Tech`;
  }, [pageName]);
};

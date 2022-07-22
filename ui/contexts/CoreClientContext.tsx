import _ from "lodash";
import * as React from "react";
import { useQuery } from "react-query";
import {
  Core,
  ListHelmReleasesResponse,
  ListKustomizationsResponse,
} from "../lib/api/core/core.pb";
import {
  FluxObjectKind,
  HelmRelease,
  Kustomization,
} from "../lib/api/core/types.pb";
import { NoNamespace, RequestError } from "../lib/types";

type Props = {
  api: typeof Core;
  children: any;
};

export type CoreClientContextType = {
  api: typeof Core;
};

export const CoreClientContext = React.createContext<CoreClientContextType>(
  null as any
);

export default function CoreClientContextProvider({ api, children }: Props) {
  return (
    <CoreClientContext.Provider value={{ api }}>
      {children}
    </CoreClientContext.Provider>
  );
}

export function useCoreClient() {
  return React.useContext(CoreClientContext);
}

export type Automation = Kustomization & HelmRelease & { kind: FluxObjectKind };

export function useListAutomations(namespace = NoNamespace) {
  const { api } = React.useContext(CoreClientContext);

  return useQuery<Automation[], RequestError>(
    "automations",
    () => {
      const p = [
        api.ListKustomizations({ namespace }),
        api.ListHelmReleases({ namespace }),
      ];

      // The typescript CLI complains about Promise.all,
      // but VSCode does not. Supress the CLI error here.
      // useQuery will still give us the correct types.
      return Promise.all<any>(p).then((result) => {
        const [kustRes, helmRes] = result;

        const kustomizations = (kustRes as ListKustomizationsResponse)
          .kustomizations;
        const helmReleases = (helmRes as ListHelmReleasesResponse).helmReleases;

        return [
          ..._.map(kustomizations, (k) => ({
            ...k,
            kind: FluxObjectKind.KindKustomization,
          })),
          ..._.map(helmReleases, (h) => ({
            ...h,
            kind: FluxObjectKind.KindHelmRelease,
          })),
        ];
      });
    },
    { retry: false, refetchInterval: 5000 }
  );
}

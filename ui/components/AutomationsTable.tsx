import _ from "lodash";
import styled from "styled-components";
import { Automation } from "../contexts/CoreClientContext";
import { FluxObjectKind, HelmRelease } from "../lib/api/core/types.pb";
import { formatURL } from "../lib/nav";
import { removeKind, statusSortHelper } from "../lib/utils";
import { Field, SortType } from "./DataTable";
import { filterByStatusCallback, filterConfig } from "./FilterableTable";
import KubeStatusIndicator, { computeMessage } from "./KubeStatusIndicator";
import Link from "./Link";
import SourceLink from "./SourceLink";
import Timestamp from "./Timestamp";
import URLAddressableTable from "./URLAddressableTable";

type Props = {
  className?: string;
  automations?: Automation[];
  appName?: string;
  hideSource?: boolean;
};

function AutomationsTable({ className, automations, hideSource }: Props) {
  automations = _.map(automations, (a) => {
    return { ...a, type: removeKind(a.kind) };
  });

  const initialFilterState = {
    ...filterConfig(automations, "type"),
    ...filterConfig(automations, "namespace"),
    ...filterConfig(automations, "clusterName"),
    ...filterConfig(automations, "status", filterByStatusCallback),
  };

  let fields: Field[] = [
    {
      label: "Name",
      value: (k) => {
        const route =
          k.kind === FluxObjectKind.KindKustomization
            ? "kustomizations"
            : "helmrelease";
        return (
          <Link
            to={formatURL(route, {
              name: k.name,
              namespace: k.namespace,
              clusterName: k.clusterName,
            })}
          >
            {k.name}
          </Link>
        );
      },
      sortValue: ({ name }) => name,
      textSearchable: true,
      maxWidth: 600,
    },
    {
      label: "Type",
      value: "type",
    },
    {
      label: "Namespace",
      value: "namespace",
    },
    {
      label: "Cluster",
      value: "clusterName",
    },
    {
      label: "Source",
      value: (a: Automation) => {
        let sourceKind: string;
        let sourceName: string;
        let sourceNamespace: string;

        if (a.kind === FluxObjectKind.KindKustomization) {
          sourceKind = a.sourceRef?.kind as string;
          sourceName = a.sourceRef?.name as string;
          sourceNamespace = a.sourceRef?.namespace as string;
        } else {
          const hr = a as HelmRelease;
          sourceKind = FluxObjectKind.KindHelmChart;
          sourceName = hr.helmChart?.name as string;
          sourceNamespace = hr.helmChart?.namespace as string;
        }

        return (
          <SourceLink
            short
            sourceRef={{
              kind: sourceKind as FluxObjectKind,
              name: sourceName,
              namespace: sourceNamespace,
            }}
            clusterName={a.clusterName || ""}
          />
        );
      },
      sortValue: (a: Automation) => a.sourceRef?.name,
    },
    {
      label: "Status",
      value: (a: Automation) =>
        (a.conditions || []).length > 0 ? (
          <KubeStatusIndicator
            short
            conditions={a.conditions || []}
            suspended={a.suspended}
          />
        ) : null,
      sortType: SortType.number,
      sortValue: statusSortHelper,
    },
    {
      label: "Message",
      value: (a: Automation) => computeMessage(a.conditions || []),
      sortValue: ({ conditions }) => computeMessage(conditions),
      maxWidth: 600,
    },
    {
      label: "Revision",
      value: "lastAttemptedRevision",
    },
    {
      label: "Last Updated",
      value: (a: Automation) => (
        <Timestamp
          time={
            _.get(_.find(a.conditions, { type: "Ready" }), "timestamp") as any
          }
        />
      ),
    },
  ];

  if (hideSource) fields = _.filter(fields, (f) => f.label !== "Source");

  return (
    <URLAddressableTable
      fields={fields}
      filters={initialFilterState}
      rows={automations || []}
      className={className}
    />
  );
}

export default styled(AutomationsTable).attrs({
  className: AutomationsTable.name,
})`
  td:nth-child(7) {
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }
`;

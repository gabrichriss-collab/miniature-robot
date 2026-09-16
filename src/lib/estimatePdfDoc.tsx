/**
 * Server-side PDF document for prisestimat downloads. Rendered via
 * @react-pdf/renderer inside the /api/prisestimat/pdf route.
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer";
import { site } from "@/lib/site";
import {
  calcTotals,
  formatNok,
  laborLinesForRows,
  type EstimateInput
} from "@/lib/estimateCalc";
import { formatHours } from "@/lib/pricing/format";
import {
  ESTIMATE_DISCLAIMER,
  ESTIMATE_DISCLAIMER_CLOSING,
  MATERIAL_TIER_LABELS
} from "@/config/pricing";

const colors = {
  ink: "#0a0a0a",
  bone: "#e7e5df",
  muted: "#666666",
  rule: "#c9c4bc"
};

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontSize: 10,
    color: colors.ink,
    fontFamily: "Helvetica",
    lineHeight: 1.5
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
    paddingBottom: 18,
    marginBottom: 32
  },
  brand: {
    fontFamily: "Helvetica-Bold",
    letterSpacing: 3,
    fontSize: 11
  },
  eyebrow: {
    fontFamily: "Helvetica",
    fontSize: 8,
    letterSpacing: 2,
    color: colors.muted,
    textTransform: "uppercase"
  },
  title: {
    fontFamily: "Times-Roman",
    fontSize: 28,
    marginTop: 14,
    marginBottom: 6
  },
  h3: {
    fontFamily: "Times-Roman",
    fontSize: 14,
    marginBottom: 6
  },
  small: { fontSize: 9, color: colors.muted },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24
  },
  metaBlock: { width: "45%" },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
    paddingBottom: 6,
    marginTop: 28,
    marginBottom: 6
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.rule,
    paddingTop: 6,
    paddingBottom: 6
  },
  colName: { width: "50%", paddingRight: 8 },
  colQty: { width: "15%", textAlign: "right" },
  colPrice: { width: "17%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right", fontFamily: "Helvetica-Bold" },
  totalsBlock: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.ink
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2
  },
  totalGrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.ink
  },
  grandLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  grandValue: {
    fontFamily: "Times-Roman",
    fontSize: 22
  },
  disclaimer: {
    marginTop: 36,
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.rule,
    fontSize: 9,
    color: colors.muted
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    fontSize: 8,
    color: colors.muted,
    borderTopWidth: 0.5,
    borderTopColor: colors.rule,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

export function EstimatePdf({ input }: { input: EstimateInput }) {
  const t = calcTotals(input);
  const laborByLabel = new Map(
    laborLinesForRows(input.rows).map((l) => [l.label, l])
  );
  const now = new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date());

  return (
    <Document
      title={`Prisestimat — ${input.projectName || "Uten navn"}`}
      author={site.legalName}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>TØMRER KAWICHE</Text>
          <Text style={styles.eyebrow}>Prisestimat · {now}</Text>
        </View>

        <Text style={styles.eyebrow}>Prosjekt</Text>
        <Text style={styles.title}>{input.projectName || "Uten navn"}</Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaBlock}>
            <Text style={styles.eyebrow}>Kunde</Text>
            <Text style={{ marginTop: 4 }}>{input.customerName || "—"}</Text>
            {input.customerEmail ? (
              <Text style={styles.small}>{input.customerEmail}</Text>
            ) : null}
            {input.customerPhone ? (
              <Text style={styles.small}>{input.customerPhone}</Text>
            ) : null}
            {input.customerPostal ? (
              <Text style={styles.small}>Postnr. {input.customerPostal}</Text>
            ) : null}
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.eyebrow}>Utsteder</Text>
            <Text style={{ marginTop: 4 }}>{site.legalName}</Text>
            <Text style={styles.small}>
              {site.address.street}, {site.address.postal} {site.address.city}
            </Text>
            <Text style={styles.small}>{site.email}</Text>
            <Text style={styles.small}>{site.phone}</Text>
            <Text style={styles.small}>Org.nr. {site.orgNumber}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.colName, styles.eyebrow]}>Beskrivelse</Text>
          <Text style={[styles.colQty, styles.eyebrow]}>Mengde</Text>
          <Text style={[styles.colPrice, styles.eyebrow]}>Timer</Text>
          <Text style={[styles.colTotal, styles.eyebrow]}>Arbeid</Text>
        </View>

        {input.rows.map((r, i) => {
          const l = laborByLabel.get(r.matchName || r.name);
          const legacy =
            (parseFloat(String(r.qty)) || 0) *
            (parseFloat(String(r.price)) || 0);
          return (
            <View key={`${r.id}-${i}`} style={styles.tableRow}>
              <View style={styles.colName}>
                <Text>{r.name || "—"}</Text>
                {r.note ? <Text style={styles.small}>{r.note}</Text> : null}
              </View>
              <Text style={styles.colQty}>
                {r.qty || "—"} {r.unit}
              </Text>
              <Text style={styles.colPrice}>
                {l ? `${formatHours(l.totalLaborHours)} t` : "—"}
              </Text>
              <Text style={styles.colTotal}>
                {l
                  ? `${formatNok(l.laborPriceExVat)} kr`
                  : legacy > 0
                    ? `${formatNok(legacy)} kr`
                    : "—"}
              </Text>
            </View>
          );
        })}

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text>
              Arbeid — {formatHours(t.laborHours)} t ×{" "}
              {formatNok(t.estimate.hourlyRateExVat)} kr/t (eks. mva)
            </Text>
            <Text>{formatNok(t.laborExVat + t.legacyExVat)} kr</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>Materialer — {MATERIAL_TIER_LABELS[t.materialTier]}</Text>
            <Text>
              {t.materialTier === "none"
                ? "ikke medregnet"
                : `${formatNok(t.materialExVat)} kr`}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>Sum eks. mva</Text>
            <Text>{formatNok(t.subtotal)} kr</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>MVA ({input.mvaRate}%)</Text>
            <Text>{formatNok(t.mvaAmount)} kr</Text>
          </View>
          <View style={styles.totalGrand}>
            <Text style={styles.grandLabel}>Estimert totalt (inkl. mva)</Text>
            <Text style={styles.grandValue}>{formatNok(t.total)} kr</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>Veiledende spenn (inkl. mva)</Text>
            <Text>
              {formatNok(t.range.low)} – {formatNok(t.range.high)} kr
            </Text>
          </View>
        </View>

        {t.estimate.unpricedMaterials.length > 0 ? (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.eyebrow}>Avklares separat</Text>
            {t.estimate.unpricedMaterials.map((u) => (
              <Text key={u.workItemKey} style={[styles.small, { marginTop: 4 }]}>
                {u.label} — {u.note}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.disclaimer}>
          <Text>
            {ESTIMATE_DISCLAIMER} {ESTIMATE_DISCLAIMER_CLOSING}
          </Text>
        </View>

        {input.message ? (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.eyebrow}>Prosjektbeskrivelse</Text>
            <Text style={{ marginTop: 6 }}>{input.message}</Text>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>
            {site.legalName} · Org.nr. {site.orgNumber} · MVA-registrert
          </Text>
          <Text>{site.url.replace("https://", "")}</Text>
        </View>
      </Page>
    </Document>
  );
}

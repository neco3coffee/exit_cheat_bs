"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import styles from "./ModeRadarChart.module.scss";

type ModeRadarDatum = {
  key: string;
  label: string;
  icon: string;
  winRate: number;
  battleCount: number;
};

type ModeRadarChartProps = {
  data: ModeRadarDatum[];
  labels: {
    tooltipWinRate: string;
    tooltipBattleCount: string;
    empty: string;
  };
};

type TickProps = {
  payload?: {
    value?: string;
    index?: number;
  };
  x?: number;
  y?: number;
  textAnchor?: string;
  stroke?: string;
  radius?: number;
};

type RadarTickProps = TickProps & {
  datum?: ModeRadarDatum;
};

const RADAR_DOMAIN: [number, number] = [0, 100];

function RadarTick({ payload, x = 0, y = 0, datum }: RadarTickProps) {
  const size = 32;
  const offset = size / 2;
  const icon = datum?.icon;
  const label = datum?.label ?? payload?.value ?? "";

  return (
    <g transform={`translate(${x}, ${y})`} className={styles.tickGroup}>
      {icon ? (
        <image
          href={icon}
          x={-offset}
          y={-offset}
          width={size}
          height={size}
          focusable="false"
        />
      ) : null}
      <text
        x={0}
        y={offset + 16}
        textAnchor="middle"
        className={styles.tickLabel}
      >
        {label}
      </text>
    </g>
  );
}

function RadarTooltip({ active, payload, labels }: any) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const datum = payload[0]?.payload as ModeRadarDatum | undefined;

  if (!datum) {
    return null;
  }

  const winRateText = `${datum.winRate.toFixed(1)}%`;
  const battleCountText = `${datum.battleCount}`;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{datum.label}</div>
      {labels.tooltipWinRate ? (
        <div className={styles.tooltipRow}>
          <span>{labels.tooltipWinRate}</span>
          <strong>{winRateText}</strong>
        </div>
      ) : null}
      {labels.tooltipBattleCount ? (
        <div className={styles.tooltipRow}>
          <span>{labels.tooltipBattleCount}</span>
          <strong>{battleCountText}</strong>
        </div>
      ) : null}
    </div>
  );
}

export function ModeRadarChart({ data, labels }: ModeRadarChartProps) {
  if (!data || data.length === 0) {
    return <p className={styles.empty}>{labels.empty}</p>;
  }

  const renderTick = (tickProps: TickProps) => {
    const tickValue = tickProps.payload?.value;
    const datum = data.find(
      (item) => item.label === tickValue || item.key === tickValue,
    );
    return <RadarTick {...tickProps} datum={datum} />;
  };

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={360}>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid strokeOpacity={0.3} />
          <PolarAngleAxis
            dataKey="label"
            tick={(props) => renderTick(props as TickProps)}
          />
          <PolarRadiusAxis
            angle={90}
            domain={RADAR_DOMAIN}
            tickFormatter={(value) => `${value}%`}
            stroke="#666"
          />
          <Radar
            dataKey="winRate"
            stroke="#FF7F50"
            fill="#FF7F50"
            fillOpacity={0.25}
            dot={{ r: 3 }}
          />
          <Tooltip
            content={(props) => <RadarTooltip {...props} labels={labels} />}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

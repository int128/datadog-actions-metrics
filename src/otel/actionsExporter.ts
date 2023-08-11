import * as core from '@actions/core'
import util from 'util'
import { ExportResult, ExportResultCode } from '@opentelemetry/core'
import {
  AggregationTemporality,
  AggregationTemporalitySelector,
  InstrumentType,
  PushMetricExporter,
  ResourceMetrics,
} from '@opentelemetry/sdk-metrics'
import { DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR } from '@opentelemetry/sdk-metrics/build/src/export/AggregationSelector'

interface ActionsMetricExporterOptions {
  temporalitySelector?: AggregationTemporalitySelector
}

// pinched from https://github.com/open-telemetry/opentelemetry-js/blob/902229afd89a2cf59b120b75892a56bdab5ff039/packages/sdk-metrics/src/export/ConsoleMetricExporter.ts#L31
export class ActionsConsoleMetricExporter implements PushMetricExporter {
  protected _shutdown = false
  protected _temporalitySelector: AggregationTemporalitySelector

  constructor(options?: ActionsMetricExporterOptions) {
    this._temporalitySelector = options?.temporalitySelector ?? DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR
  }

  export(metrics: ResourceMetrics, resultCallback: (result: ExportResult) => void): void {
    console.log('ActionsConsoleMetricExporter.export')

    if (this._shutdown) {
      // If the exporter is shutting down, by spec, we need to return FAILED as export result
      setImmediate(resultCallback, { code: ExportResultCode.FAILED })
      return
    }

    return ActionsConsoleMetricExporter._sendMetrics(metrics, resultCallback)
  }

  forceFlush(): Promise<void> {
    return Promise.resolve()
  }

  selectAggregationTemporality(_instrumentType: InstrumentType): AggregationTemporality {
    return this._temporalitySelector(_instrumentType)
  }

  shutdown(): Promise<void> {
    this._shutdown = true
    return Promise.resolve()
  }

  private static _sendMetrics(metrics: ResourceMetrics, done: (result: ExportResult) => void): void {
    console.log('ActionsConsoleMetricExporter._sendMetrics')

    for (const scopeMetrics of metrics.scopeMetrics) {
      for (const metric of scopeMetrics.metrics) {
        // core.info(
        //   util.inspect({
        //     descriptor: metric.descriptor,
        //     dataPointType: metric.dataPointType,
        //     dataPoints: metric.dataPoints,
        //   })
        // )
        core.info(JSON.stringify(metric, null, 2))
      }
    }

    done({ code: ExportResultCode.SUCCESS })
  }
}

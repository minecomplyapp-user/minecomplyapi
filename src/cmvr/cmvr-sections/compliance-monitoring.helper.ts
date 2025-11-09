import {
  Paragraph,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
} from 'docx';
import type { CMVRGeneralInfo } from '../cmvr-pdf-generator.service';
import {
  createTableBorders,
  createText,
  createParagraph,
} from './general-use.helper';

export function createComplianceToProjectLocationTable(
  section: NonNullable<
    CMVRGeneralInfo['complianceToProjectLocationAndCoverageLimits']
  >,
): Table {
  const rows: TableRow[] = [];
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [createParagraph('Parameter', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [
            createParagraph('Specification', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [
            createParagraph('Within Specs', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [createParagraph('Remarks', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    }),
  );

  const toStr = (v: unknown) => {
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object') {
      try {
        return Object.entries(v as Record<string, unknown>)
          .map(
            ([k, val]) =>
              `${k}: ${
                val == null
                  ? '-'
                  : typeof val === 'object'
                    ? JSON.stringify(val)
                    : `${val as string | number | boolean}`
              }`,
          )
          .join('\n');
      } catch {
        return JSON.stringify(v);
      }
    }
    return '-';
  };

  section.parameters?.forEach((p) => {
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(p.name || '-', false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                toStr(p.specification),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                p.withinSpecs ? 'Yes' : p.withinSpecs === false ? 'No' : '-',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(toStr(p.remarks), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
  });

  const otherComponents = (section.otherComponents || []) as Array<{
    name?: string;
    specification?: unknown;
    withinSpecs?: boolean;
    remarks?: unknown;
  }>;
  otherComponents.forEach((c) => {
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(
                c.name || 'Other Components',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                toStr(c.specification),
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                c.withinSpecs ? 'Yes' : c.withinSpecs === false ? 'No' : '-',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(toStr(c.remarks), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: createTableBorders(),
    rows,
  });
}

export function createComplianceToImpactManagementCommitmentsTables(
  section: NonNullable<
    CMVRGeneralInfo['complianceToImpactManagementCommitments']
  >,
): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  const build = (
    title: string,
    groups?: Array<{
      areaName?: string;
      commitments?: Array<{
        plannedMeasure?: string;
        actualObservation?: string;
        isEffective?: boolean | null;
        recommendations?: string;
      }>;
    }>,
  ) => {
    if (!groups || groups.length === 0) return;
    out.push(
      new Paragraph({
        children: [createText(title, true)],
        spacing: { before: 100, after: 100 },
      }),
    );
    const rows: TableRow[] = [];
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph('Area Name', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('Planned Measure', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('Actual Observation', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('Effective', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('Recommendations', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
    for (const g of groups) {
      for (const c of g.commitments || []) {
        rows.push(
          new TableRow({
            height: { value: 400, rule: 'atLeast' },
            children: [
              new TableCell({
                children: [
                  createParagraph(
                    g.areaName || '-',
                    false,
                    AlignmentType.CENTER,
                  ),
                ],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [
                  createParagraph(
                    c.plannedMeasure || '-',
                    false,
                    AlignmentType.CENTER,
                  ),
                ],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [
                  createParagraph(
                    c.actualObservation || '-',
                    false,
                    AlignmentType.CENTER,
                  ),
                ],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [
                  createParagraph(
                    c.isEffective === null ? '-' : c.isEffective ? 'Yes' : 'No',
                    false,
                    AlignmentType.CENTER,
                  ),
                ],
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [
                  createParagraph(
                    c.recommendations || '-',
                    false,
                    AlignmentType.CENTER,
                  ),
                ],
                verticalAlign: VerticalAlign.CENTER,
              }),
            ],
          }),
        );
      }
    }
    out.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: createTableBorders(),
        rows,
      }),
    );
  };

  build('Construction Info', section.constructionInfo);
  build(
    'Implementation of Environmental Impact Control Strategies',
    section.implementationOfEnvironmentalImpactControlStrategies,
  );
  if (section.overallComplianceAssessment)
    out.push(
      createParagraph(
        `Overall Compliance Assessment: ${section.overallComplianceAssessment}`,
      ),
    );
  return out;
}

export function createAirQualitySection(
  air: NonNullable<CMVRGeneralInfo['airQualityImpactAssessment']>,
): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];

  const buildLocationTable = (
    locationData: {
      locationInput?: string;
      parameters?: Array<{
        name?: string;
        results?: {
          inSMR?: {
            current?: string;
            previous?: string;
          };
          mmtConfirmatorySampling?: {
            current?: string;
            previous?: string;
          };
        };
        eqpl?: {
          redFlag?: string;
          action?: string;
          limit?: string;
        };
        remarks?: string;
      }>;
      samplingDate?: string;
      weatherAndWind?: string;
      explanationForConfirmatorySampling?: string;
      overallAssessment?: string;
    },
    locationName: string,
  ) => {
    const locationOut: (Paragraph | Table)[] = [];

    if (!locationData.parameters || locationData.parameters.length === 0) {
      return locationOut;
    }

    locationOut.push(createParagraph(locationName, true));

    if (locationData.locationInput) {
      locationOut.push(createParagraph(locationData.locationInput));
    }

    const rows: TableRow[] = [];
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph('Parameter', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('In SMR (Current)', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('In SMR (Previous)', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                'Confirmatory (Current)',
                true,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                'Confirmatory (Previous)',
                true,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [createParagraph('Red Flag', true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [createParagraph('Action', true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [createParagraph('Limit', true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [createParagraph('Remarks', true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );

    locationData.parameters.forEach((p) => {
      rows.push(
        new TableRow({
          height: { value: 400, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                createParagraph(p.name || '-', false, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.results?.inSMR?.current || '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.results?.inSMR?.previous || '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.results?.mmtConfirmatorySampling?.current || '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.results?.mmtConfirmatorySampling?.previous || '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.eqpl?.redFlag || '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.eqpl?.action || '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.eqpl?.limit || '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(p.remarks || '-', false, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
      );
    });

    locationOut.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: createTableBorders(),
        rows,
      }),
    );

    if (locationData.samplingDate)
      locationOut.push(
        createParagraph(`Sampling Date: ${locationData.samplingDate}`),
      );
    if (locationData.weatherAndWind)
      locationOut.push(
        createParagraph(`Weather & Wind: ${locationData.weatherAndWind}`),
      );
    if (locationData.explanationForConfirmatorySampling)
      locationOut.push(
        createParagraph(
          `Explanation for Confirmatory Sampling: ${locationData.explanationForConfirmatorySampling}`,
        ),
      );
    if (locationData.overallAssessment)
      locationOut.push(
        createParagraph(
          `Overall Assessment: ${locationData.overallAssessment}`,
        ),
      );

    return locationOut;
  };

  if (air.quarry) {
    out.push(...buildLocationTable(air.quarry, 'Quarry'));
  }
  if (air.plant) {
    out.push(...buildLocationTable(air.plant, 'Plant'));
  }
  if (air.quarryAndPlant) {
    out.push(...buildLocationTable(air.quarryAndPlant, 'Quarry & Plant'));
  }
  if (air.port) {
    out.push(...buildLocationTable(air.port, 'Port'));
  }

  return out;
}

export function createWaterQualitySection(
  wq: NonNullable<CMVRGeneralInfo['waterQualityImpactAssessment']>,
): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];

  const buildLocationTable = (
    locationData: {
      locationDescription?: string;
      locationInput?: string;
      parameters?: Array<{
        name?: string;
        result?: {
          internalMonitoring?: {
            month?: string;
            readings?: Array<{
              label?: string;
              current_mgL?: number;
              previous_mgL?: number;
            }>;
          };
          mmtConfirmatorySampling?: {
            current?: string;
            previous?: string;
          };
        };
        denrStandard?: {
          redFlag?: string;
          action?: string;
          limit_mgL?: number;
        };
        remark?: string;
      }>;
      samplingDate?: string;
      weatherAndWind?: string;
      explanationForConfirmatorySampling?: string;
      overallAssessment?: string;
    },
    locationName: string,
  ) => {
    const locationOut: (Paragraph | Table)[] = [];

    if (!locationData.parameters || locationData.parameters.length === 0) {
      return locationOut;
    }

    const locationLabel = locationData.locationDescription?.trim()
      ? `${locationName} – ${locationData.locationDescription}`
      : locationData.locationInput?.trim()
        ? `${locationName} – ${locationData.locationInput}`
        : locationName;

    locationOut.push(createParagraph(locationLabel, true));

    const rows: TableRow[] = [];
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph('Parameter', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                'Internal Monitoring',
                true,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                'Confirmatory (Current/Prev)',
                true,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('DENR Red Flag', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('DENR Action', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('DENR Limit (mg/L)', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [createParagraph('Remark', true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );

    locationData.parameters.forEach((p) => {
      const im = p.result?.internalMonitoring;
      const imText = im
        ? `${im.month || ''} ${(im.readings || [])
            .map(
              (r) =>
                `${r.label}: ${r.current_mgL ?? '-'} / ${r.previous_mgL ?? '-'}`,
            )
            .join(', ')}`
        : '-';
      const confirm = `${p.result?.mmtConfirmatorySampling?.current || '-'} / ${p.result?.mmtConfirmatorySampling?.previous || '-'}`;
      rows.push(
        new TableRow({
          height: { value: 400, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                createParagraph(p.name || '-', false, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [createParagraph(imText, false, AlignmentType.CENTER)],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [createParagraph(confirm, false, AlignmentType.CENTER)],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.denrStandard?.redFlag || '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.denrStandard?.action || '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.denrStandard?.limit_mgL != null
                    ? String(p.denrStandard.limit_mgL)
                    : '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(p.remark || '-', false, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
      );
    });

    locationOut.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: createTableBorders(),
        rows,
      }),
    );

    if (locationData.samplingDate)
      locationOut.push(
        createParagraph(`Sampling Date: ${locationData.samplingDate}`),
      );
    if (locationData.weatherAndWind)
      locationOut.push(
        createParagraph(`Weather & Wind: ${locationData.weatherAndWind}`),
      );
    if (locationData.explanationForConfirmatorySampling)
      locationOut.push(
        createParagraph(
          `Explanation for Confirmatory Sampling: ${locationData.explanationForConfirmatorySampling}`,
        ),
      );
    if (locationData.overallAssessment)
      locationOut.push(
        createParagraph(
          `Overall Assessment: ${locationData.overallAssessment}`,
        ),
      );

    return locationOut;
  };

  // Generate sections for each location
  if (wq.quarry) {
    out.push(...buildLocationTable(wq.quarry, 'Quarry'));
  }
  if (wq.plant) {
    out.push(...buildLocationTable(wq.plant, 'Plant'));
  }
  if (wq.quarryAndPlant) {
    out.push(...buildLocationTable(wq.quarryAndPlant, 'Quarry/Plant'));
  }
  if (wq.port) {
    out.push(...buildLocationTable(wq.port, 'Port'));
  }

  return out;
}

export function createNoiseQualityTable(
  nq: NonNullable<CMVRGeneralInfo['noiseQualityImpactAssessment']>,
): Table {
  const rows: TableRow[] = [];
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [createParagraph('Parameter', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [
            createParagraph('In SMR (Current)', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [
            createParagraph('In SMR (Previous)', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [
            createParagraph(
              'Confirmatory (Current)',
              true,
              AlignmentType.CENTER,
            ),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [
            createParagraph(
              'Confirmatory (Previous)',
              true,
              AlignmentType.CENTER,
            ),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [createParagraph('Red Flag', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [createParagraph('Action', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [
            createParagraph('DENR Standard', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [createParagraph('Remarks', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    }),
  );
  nq.parameters?.forEach((p) => {
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(p.name || '-', false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                p.results?.inSMR?.current || '-',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                p.results?.inSMR?.previous || '-',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                p.results?.mmtConfirmatorySampling?.current || '-',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                p.results?.mmtConfirmatorySampling?.previous || '-',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                p.eqpl?.redFlag || '-',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                p.eqpl?.action || '-',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                p.eqpl?.denrStandard || '-',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(p.remarks || '-', false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: createTableBorders(),
    rows,
  });
}

export function createSolidAndHazardousWasteSection(
  section: NonNullable<
    CMVRGeneralInfo['complianceWithGoodPracticeInSolidAndHazardousWasteManagement']
  >,
): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  type WasteRow = {
    typeOfWaste?: string;
    eccEpepCommitments?: {
      handling?: string;
      storage?: string;
      disposal?: boolean;
    };
    adequate?: { y?: boolean; n?: boolean };
    previousRecord?: unknown;
    q2_2025_Generated_HW?: unknown;
    total?: unknown;
  };
  const toStr = (v: unknown) => {
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object') {
      try {
        return Object.entries(v as Record<string, unknown>)
          .map(
            ([k, val]) =>
              `${k}: ${
                val == null
                  ? '-'
                  : typeof val === 'object'
                    ? JSON.stringify(val)
                    : `${val as string | number | boolean}`
              }`,
          )
          .join('\n');
      } catch {
        return JSON.stringify(v);
      }
    }
    return '-';
  };
  const build = (label: string, data?: string | WasteRow[]) => {
    if (!data) return;
    out.push(
      new Paragraph({
        children: [createText(label, true)],
        spacing: { before: 100, after: 100 },
      }),
    );
    if (typeof data === 'string') {
      out.push(createParagraph(data));
      return;
    }
    const rows: TableRow[] = [];
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph('Type of Waste', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('ECC/EPEP Handling', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('ECC/EPEP Storage', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('ECC/EPEP Disposal', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('Adequate (Y/N)', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph('Previous Record', true, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                'Q2 2025 Generated HW',
                true,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [createParagraph('Total', true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
    data.forEach((row) => {
      rows.push(
        new TableRow({
          height: { value: 400, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                createParagraph(
                  row.typeOfWaste || '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  row.eccEpepCommitments?.handling || '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  row.eccEpepCommitments?.storage || '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  row.eccEpepCommitments?.disposal ? 'Yes' : 'No',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  row.adequate?.y ? 'Y' : row.adequate?.n ? 'N' : '-',
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  toStr(row.previousRecord),
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(
                  toStr(row.q2_2025_Generated_HW),
                  false,
                  AlignmentType.CENTER,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(toStr(row.total), false, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
      );
    });
    out.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: createTableBorders(),
        rows,
      }),
    );
  };

  build('Quarry', section.quarry);
  build('Plant', section.plant);
  build('Port', section.port);
  return out;
}

export function createComplaintsVerificationAndManagement(
  nq: NonNullable<CMVRGeneralInfo['complaintsVerificationAndManagement']>,
): (Paragraph | Table)[] {
  const rows: TableRow[] = [];

  // Header Row 1
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          rowSpan: 2,
          // Changed the first cell to display 'Date Filed' for better context (original code was using p.dateFiled in this cell's row, but the header didn't reflect it)
          children: [createParagraph('Date Filed', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          columnSpan: 4,
          children: [
            createParagraph('Filed Where?', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          rowSpan: 2,
          children: [
            createParagraph('Nature of Complaint', true, AlignmentType.CENTER), // Typo fixed in function
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          rowSpan: 2,
          children: [
            createParagraph('Resolutions made', true, AlignmentType.CENTER), // Typo fixed
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    }),
  );

  // Header Row 2
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [createParagraph('DENR', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [createParagraph('Company', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [createParagraph('MMT', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [
            createParagraph('Others, Specify', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    }),
  );

  // Data Rows
  nq.forEach((p) => {
    // Logic to check the single filedLocation string against columns
    const isDenr = p.filedLocation?.toLowerCase() === 'denr';
    const isCompany = p.filedLocation?.toLowerCase() === 'company';
    const isMmt = p.filedLocation?.toLowerCase() === 'mmt';

    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          new TableCell({
            // Data row is not bolded (false)
            children: [
              createParagraph(
                p.dateFiled || 'N/A',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(isDenr ? 'Y' : '', false, AlignmentType.CENTER), // Fixed: check filedLocation
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                isCompany ? 'Y' : '',
                false,
                AlignmentType.CENTER,
              ), // Fixed: check filedLocation
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(isMmt ? 'Y' : '', false, AlignmentType.CENTER), // Fixed: check filedLocation
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                p.othersSpecify || '',
                false,
                AlignmentType.CENTER,
              ), // Fixed property name
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(p.nature || '', false, AlignmentType.LEFT), // Fixed property name to 'nature'
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(p.resolutions || '', false, AlignmentType.LEFT), // Fixed property name to 'resolutions'
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
  });

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createTableBorders(),
      rows,
    }),
  ];
}

export function createRecommendationTable(
  nq:
    | NonNullable<CMVRGeneralInfo['recommendationFromPrevQuarter']>
    | NonNullable<CMVRGeneralInfo['recommendationForNextQuarter']>,
): (Paragraph | Table)[] {
  const rows: TableRow[] = [];
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [
            createParagraph('Recommendations', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [createParagraph('Commitment', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [createParagraph('Status', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    }),
  );
  if (nq.plant && nq.plant.length > 0) {
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          new TableCell({
            columnSpan: 3,
            children: [createParagraph('Plant', true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );

    nq.plant?.forEach((p) => {
      rows.push(
        new TableRow({
          height: { value: 600, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                createParagraph(
                  p.recommendation || 'N/A',
                  false,
                  AlignmentType.LEFT,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER, // Alignment to LEFT for better readability
            }),
            new TableCell({
              children: [
                createParagraph(p.commitment ?? '', false, AlignmentType.LEFT), // Alignment to LEFT for better readability
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(p.status ?? '', false, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
      );
    });
  }
  if (nq.quarry && nq.quarry.length > 0) {
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          new TableCell({
            columnSpan: 3,
            children: [createParagraph('Quarry', true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );

    nq.quarry?.forEach((p) => {
      rows.push(
        new TableRow({
          height: { value: 600, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                createParagraph(
                  p.recommendation || 'N/A',
                  false,
                  AlignmentType.LEFT,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER, // Alignment to LEFT for better readability
            }),
            new TableCell({
              children: [
                createParagraph(p.commitment ?? '', false, AlignmentType.LEFT), // Alignment to LEFT for better readability
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(p.status ?? '', false, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
      );
    });
  }

  if (nq.port && nq.port.length > 0) {
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          new TableCell({
            columnSpan: 3,

            children: [createParagraph('PORT', true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );

    nq.port?.forEach((p) => {
      rows.push(
        new TableRow({
          height: { value: 600, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                createParagraph(
                  p.recommendation || 'N/A',
                  false,
                  AlignmentType.LEFT,
                ),
              ],
              verticalAlign: VerticalAlign.CENTER, // Alignment to LEFT for better readability
            }),
            new TableCell({
              children: [
                createParagraph(p.commitment ?? '', false, AlignmentType.LEFT), // Alignment to LEFT for better readability
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                createParagraph(p.status ?? '', false, AlignmentType.CENTER),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
      );
    });
  }

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createTableBorders(),

      rows,
    }),
  ];
}

export function complianceWithGoodPracticeInChemicalSafetyManagement(
  nq: NonNullable<
    CMVRGeneralInfo['complianceWithGoodPracticeInChemicalSafetyManagement']
  >,
): (Paragraph | Table)[] {
  const rows: TableRow[] = [];

  // Header Rows (Unchanged)
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          rowSpan: 2,
          children: [
            createParagraph(
              'Chemicals in PCL and COO',
              true,
              AlignmentType.CENTER,
            ),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          columnSpan: 4,
          children: [createParagraph('Adequate?', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          rowSpan: 2,
          children: [createParagraph('Remarks', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    }),
  );

  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [
            createParagraph('Risk Management', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [createParagraph('Training', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [createParagraph('Handling', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [
            createParagraph(
              'Emergency Preparedness',
              true,
              AlignmentType.CENTER,
            ),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    }),
  );

  const cs = nq.chemicalSafety; // Access the nested chemicalSafety object

  // Data Row
  if (cs) {
    const chemicalText = cs.chemicalCategory || cs.othersSpecify || 'N/A';

    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          new TableCell({
            // Use the chemical category for the first cell
            children: [
              createParagraph(chemicalText, false, AlignmentType.LEFT),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                cs.riskManagement ? 'Y' : 'N', // Check for existence of the string value
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                cs.training ? 'Y' : 'N',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                cs.handling ? 'Y' : 'N',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(
                cs.emergencyPreparedness ? 'Y' : 'N',
                false,
                AlignmentType.CENTER,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              createParagraph(cs.remarks || '-', false, AlignmentType.LEFT),
            ],
          }),
        ],
      }),
    );
  } else {
    // If no chemical safety data is present, push an empty row
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [createParagraph('N/A', false, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [createParagraph('', false, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [createParagraph('', false, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [createParagraph('', false, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [createParagraph('', false, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [createParagraph('', false, AlignmentType.LEFT)],
          }),
        ],
      }),
    );
  }

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createTableBorders(),
      rows,
    }),
  ];
}

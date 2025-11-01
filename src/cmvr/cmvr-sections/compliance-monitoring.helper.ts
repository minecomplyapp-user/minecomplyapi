import {
  Paragraph,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  TableAnchorType,
  WidthType,
  VerticalAlign,
  TextRun,
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

  // Header row 1 - Main headers
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [createParagraph('Parameter', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: 2,
          
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('Specification', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: 2,
          width: { size: 35, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph('w/ in specs?', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
          columnSpan: 2,
          width: { size: 14, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            createParagraph(
              'Remarks – Description of Actual Implementation',
              true,
              AlignmentType.CENTER,
            ),
          ],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: 2,
          width: { size: 26, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  );

  // Header row 2 - Y and N sub-headers
  rows.push(
    new TableRow({
      height: { value: 400, rule: 'atLeast' },
      children: [
        new TableCell({
          children: [createParagraph('Y', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 7, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [createParagraph('N', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 7, type: WidthType.PERCENTAGE },
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

  // Function to create formatted paragraph with bold labels for nested objects
  const createFormattedSpecification = (v: unknown): Paragraph => {
    if (typeof v === 'string') {
      return createParagraph(v, false, AlignmentType.LEFT);
    }
    if (v && typeof v === 'object') {
      const entries = Object.entries(v as Record<string, unknown>);
      if (entries.length === 0) {
        return createParagraph('-', false, AlignmentType.LEFT);
      }

      const children: TextRun[] = [];
      entries.forEach(([key, val], index) => {
        // Add line break before each entry except the first
        if (index > 0) {
          children.push(new TextRun({ break: 1, font: 'Arial', size: 22 }));
        }

        // Capitalize and format the key (e.g., "plant" -> "Plant:")
        const formattedKey =
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        children.push(createText(`${formattedKey}:`, true));
        children.push(new TextRun({ text: ' ', font: 'Arial', size: 22 }));

        // Add the value
        const valStr =
          val == null
            ? '-'
            : typeof val === 'object'
              ? JSON.stringify(val)
              : `${val as string | number | boolean}`;
        children.push(createText(valStr, false));
      });

      return new Paragraph({
        children,
        alignment: AlignmentType.LEFT,
        indent: { left: 100, right: 100 },
      });
    }
    return createParagraph('-', false, AlignmentType.LEFT);
  };

  const yCol = (v: boolean | undefined) => (v === true ? '✓' : '');
  const nCol = (v: boolean | undefined) => (v === false ? '✓' : '');

  section.parameters?.forEach((p) => {
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              createParagraph(p.name || '-', false, AlignmentType.LEFT),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [createFormattedSpecification(p.specification)],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 35, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(yCol(p.withinSpecs), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(nCol(p.withinSpecs), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(toStr(p.remarks), false, AlignmentType.LEFT),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 26, type: WidthType.PERCENTAGE },
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
                AlignmentType.LEFT,
              ),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [createFormattedSpecification(c.specification)],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 35, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(yCol(c.withinSpecs), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(nCol(c.withinSpecs), false, AlignmentType.CENTER),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 7, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              createParagraph(toStr(c.remarks), false, AlignmentType.LEFT),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 26, type: WidthType.PERCENTAGE },
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
  const notes: string[] = [];
  if (air.quarry) notes.push(`Quarry: ${air.quarry}`);
  if (air.quarryPlant) notes.push(`Quarry Plant: ${air.quarryPlant}`);
  if (air.plant) notes.push(`Plant: ${air.plant}`);
  if (air.port) notes.push(`Port: ${air.port}`);
  if (notes.length) out.push(createParagraph(notes.join(' | ')));

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
  air.parameters?.forEach((p) => {
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
  out.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createTableBorders(),
      rows,
    }),
  );

  if (air.samplingDate) out.push(createParagraph(air.samplingDate));
  if (air.weatherAndWind) out.push(createParagraph(air.weatherAndWind));
  if (air.explanationForConfirmatorySampling)
    out.push(
      createParagraph(
        `Explanation for Confirmatory Sampling: ${air.explanationForConfirmatorySampling}`,
      ),
    );
  if (air.overallAssessment)
    out.push(createParagraph(`Overall Assessment: ${air.overallAssessment}`));
  return out;
}

export function createWaterQualitySection(
  wq: NonNullable<CMVRGeneralInfo['waterQualityImpactAssessment']>,
): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  const notes: string[] = [];
  if (wq.quarry) notes.push(`Quarry: ${wq.quarry}`);
  if (wq.quarryPlant) notes.push(`Quarry Plant: ${wq.quarryPlant}`);
  if (wq.plant) notes.push(`Plant: ${wq.plant}`);
  if (wq.port) notes.push(`Port: ${wq.port}`);
  if (notes.length) out.push(createParagraph(notes.join(' | ')));

  const buildTable = (
    params?: NonNullable<
      CMVRGeneralInfo['waterQualityImpactAssessment']
    >['parameters'],
  ) => {
    if (!params || params.length === 0) return undefined as unknown as Table;
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
    params.forEach((p) => {
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
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createTableBorders(),
      rows,
    });
  };

  const t1 = buildTable(wq.parameters);
  if (t1) out.push(t1);
  const t2 = buildTable(wq.parametersTable2);
  if (t2) out.push(t2);

  if (wq.samplingDate)
    out.push(createParagraph(`Sampling Date: ${wq.samplingDate}`));
  if (wq.weatherAndWind)
    out.push(createParagraph(`Weather & Wind: ${wq.weatherAndWind}`));
  if (wq.explanationForConfirmatorySampling)
    out.push(
      createParagraph(
        `Explanation for Confirmatory Sampling: ${wq.explanationForConfirmatorySampling}`,
      ),
    );
  if (wq.overallAssessment)
    out.push(createParagraph(`Overall Assessment: ${wq.overallAssessment}`));
  return out;
}

export function createNoiseQualityTable(
  nq: NonNullable<CMVRGeneralInfo['noiseQualityImpactAssessment']>,
): Table {
 const columnWidths=[1321, // 1. Parameter (2.33 cm)
    1174, // 2. In SMR Current (0.89 cm)
    1174, // 3. In SMR Previous (0.89 cm)
    1174, // 4. MMT Current (0.89 cm)
    1174, // 5. MMT Previous (0.89 cm)
    505,  // 6. Red Flag (0.89 cm)
    505,  // 7. Action (0.89 cm)
    1219, // 8. DENR Standard (2.15 cm)
    1491, // 9. Remarks (2.63 cm)
    ]




  const rows: TableRow[] = [];
  rows.push(
    new TableRow({
      
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },

          rowSpan:3,
          children: [createParagraph('Parameter', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          columnSpan:4,
          children: [
            createParagraph('Results', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          columnSpan:3,
          children: [
            createParagraph('EQPL', true, AlignmentType.CENTER),
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          rowSpan:3,
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
          columnSpan:2,
         
          children: [createParagraph('In SMR', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          columnSpan:2,
       
          children: [createParagraph('MMT Confirmatory Sampling', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          rowSpan:2,
          children: [createParagraph('Red Flag', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          rowSpan:2,
          children: [createParagraph('Action', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          rowSpan:2,
          
          children: [createParagraph('DENR Standard Class C - Daytime', true, AlignmentType.CENTER)],
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
          
          children: [createParagraph('Current', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
         new TableCell({
          
          children: [createParagraph('Previous', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
         new TableCell({
          
          children: [createParagraph('Current', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
         new TableCell({
          
          children: [createParagraph('Previous', true, AlignmentType.CENTER)],
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
   rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          columnSpan: 9,

          
          children: [createParagraph(`Date/ time of sampling: ${nq.samplingDate || ''}`, false, AlignmentType.LEFT)],
          verticalAlign: VerticalAlign.CENTER,
        })
      ]
    }
  ));

     rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
         new TableCell({
          columnSpan: 9,

          children: [createParagraph(`Weather and wind direction: ${nq.weatherAndWind || ''}`, false, AlignmentType.LEFT)],
          verticalAlign: VerticalAlign.CENTER,
        })
      ]
    }
  ));

      rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          columnSpan: 9,

          children: [createParagraph(`Explanation of why confirmatory sampling was conducted for specific parameter in the sampling station: ${nq.explanationForConfirmatorySampling || ''}`, false, AlignmentType.LEFT)],
          verticalAlign: VerticalAlign.CENTER,
        })
      ]
    }
  ));
  
 const totalTableWidth = 9357;
  return new Table({

    columnWidths: columnWidths,
    width: { size: totalTableWidth, type: WidthType.DXA },
    borders: createTableBorders(),
    
    rows,
  });
}



export function createOverallNoiseQualityTable(
  nq: NonNullable<CMVRGeneralInfo['noiseQualityImpactAssessment']>,
): Table {



 const columnWidths=[1321, // 1. Parameter (2.33 cm)
    1174, // 2. In SMR Current (0.89 cm)
    1174, // 3. In SMR Previous (0.89 cm)
    1174, // 4. MMT Current (0.89 cm)
    1174, // 5. MMT Previous (0.89 cm)
    505,  // 6. Red Flag (0.89 cm)
    505,  // 7. Action (0.89 cm)
    1219, // 8. DENR Standard (2.15 cm)
    1491, // 9. Remarks (2.63 cm)
    ]


  const rows: TableRow[] = [];
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        new TableCell({
          rowSpan:2,
          children: [createParagraph('Overall Noise Quality Impact Assessment', true, AlignmentType.CENTER)],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          
          children: [
          createParagraph(`1st Quarter ${nq.overallAssessment?.firstQuarter?.year || ''}`, true, AlignmentType.CENTER),         
         ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
         
          children: [
          createParagraph(`2nd Quarter ${nq.overallAssessment?.secondQuarter?.year || ''}`, true, AlignmentType.CENTER),         
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
         
          children: [
          createParagraph(`3rd Quarter ${nq.overallAssessment?.thirdQuarter?.year || ''}`, true, AlignmentType.CENTER),         

          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
         new TableCell({
         
          children: [
          createParagraph(`4th Quarter ${nq.overallAssessment?.fourthQuarter?.year || ''}`, true, AlignmentType.CENTER),         
            
          ],
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
          createParagraph(nq.overallAssessment?.firstQuarter?.assessment || '', false, AlignmentType.CENTER),         
         ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
         
          children: [
          createParagraph(nq.overallAssessment?.secondQuarter?.assessment || '', false, AlignmentType.CENTER),         
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
         
          children: [
          createParagraph(nq.overallAssessment?.thirdQuarter?.assessment || '', false, AlignmentType.CENTER),         

          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
         new TableCell({
         
          children: [
          createParagraph(nq.overallAssessment?.fourthQuarter?.assessment || '', false, AlignmentType.CENTER),         
            
          ],
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    }),
  );


  return new Table({
    columnWidths: columnWidths,
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

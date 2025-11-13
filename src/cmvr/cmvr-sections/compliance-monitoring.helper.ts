import {
  Paragraph,
  TextRun,
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

  // Helper functions for consistent text formatting (Arial 11pt = 22 half-points)
  const createTextRun = (text: string, bold = false) => {
    return new TextRun({
      text,
      bold,
      font: 'Arial',
      size: 22, // 11pt
    });
  };

  // Cell padding in twips (5pt = 100 twips)
  const cellMargins = {
    top: 100,
    bottom: 100,
    left: 100,
    right: 100,
  };

  const createLeftAlignedCell = (
    content: (TextRun | Paragraph)[],
    opts: Record<string, unknown> = {},
  ) => {
    const children =
      content[0] instanceof Paragraph
        ? (content as Paragraph[])
        : [
            new Paragraph({
              children: content as TextRun[],
              alignment: AlignmentType.LEFT,
            }),
          ];

    return new TableCell({
      children,
      verticalAlign: VerticalAlign.CENTER,
      margins: cellMargins,
      ...opts,
    });
  };

  const createCenteredCell = (
    text: string,
    opts: Record<string, unknown> = {},
  ) => {
    return new TableCell({
      children: [
        new Paragraph({
          children: [createTextRun(text)],
          alignment: AlignmentType.CENTER,
        }),
      ],
      verticalAlign: VerticalAlign.CENTER,
      margins: cellMargins,
      ...opts,
    });
  };

  // Header Row 1: Parameter, Specification, "w/ in specs?" (merged), Remarks
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Parameter', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 25, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Specification', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 40, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('w/ in specs?', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          columnSpan: 2,
          width: { size: 15, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                createTextRun(
                  'Remarks – Description of Actual Implementation',
                  true,
                ),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 20, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
      ],
    }),
  );

  // Header Row 2: Y and N columns
  rows.push(
    new TableRow({
      children: [
        createCenteredCell(''),
        createCenteredCell(''),
        createCenteredCell('Y', {
          width: { size: 7.5, type: WidthType.PERCENTAGE },
        }),
        createCenteredCell('N', {
          width: { size: 7.5, type: WidthType.PERCENTAGE },
        }),
        createCenteredCell(''),
      ],
    }),
  );

  // Helper to convert specification to formatted paragraphs
  const formatSpecification = (
    spec: unknown,
    parameterName?: string,
  ): Paragraph[] => {
    if (!spec) return [new Paragraph({ children: [createTextRun('-')] })];

    if (typeof spec === 'string') {
      return [
        new Paragraph({
          children: [createTextRun(spec)],
          alignment: AlignmentType.LEFT,
        }),
      ];
    }

    if (typeof spec === 'object' && spec !== null) {
      const paragraphs: Paragraph[] = [];
      const obj = spec as Record<string, unknown>;

      // Special handling for specific parameters
      const needsHeaders = [
        'Power Supply',
        'Mining Equipment',
        'Workforce',
        'Work Force',
      ].includes(parameterName || '');

      for (const [key, value] of Object.entries(obj)) {
        // Skip "main" key - display its value directly without header
        if (key.toLowerCase() === 'main') {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              paragraphs.push(
                new Paragraph({
                  children: [createTextRun(String(item))],
                  alignment: AlignmentType.LEFT,
                }),
              );
            });
          } else if (value && typeof value === 'object') {
            const nested = value as Record<string, unknown>;
            for (const [nestedKey, nestedValue] of Object.entries(nested)) {
              paragraphs.push(
                new Paragraph({
                  children: [
                    createTextRun(`${nestedKey}: ${String(nestedValue)}`),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              );
            }
          } else {
            paragraphs.push(
              new Paragraph({
                children: [createTextRun(String(value))],
                alignment: AlignmentType.LEFT,
              }),
            );
          }
          continue; // Skip to next key
        }

        if (Array.isArray(value)) {
          // Add header inside cell for specific sections
          if (needsHeaders) {
            // Add main header (Plant, Port, Quarry/Plant, Employees)
            const headerMap: Record<string, string> = {
              Plant: 'Plant:',
              Port: 'Port:',
              'Quarry/Plant': 'Quarry/ Plant:',
              'Quarry/ Plant': 'Quarry/ Plant:',
              Employees: 'Employees:',
            };
            const headerText = headerMap[key] || `${key}:`;
            paragraphs.push(
              new Paragraph({
                children: [createTextRun(headerText, true)],
                alignment: AlignmentType.LEFT,
              }),
            );
          } else {
            // Original behavior for other parameters
            paragraphs.push(
              new Paragraph({
                children: [createTextRun(`${key}:`, true)],
                alignment: AlignmentType.LEFT,
              }),
            );
          }
          // Bulleted list items
          value.forEach((item) => {
            paragraphs.push(
              new Paragraph({
                children: [createTextRun(`•  ${String(item)}`)],
                alignment: AlignmentType.LEFT,
                indent: { left: 200 },
              }),
            );
          });
        } else if (value && typeof value === 'object') {
          // Nested object - show as sub-items
          if (needsHeaders) {
            const headerMap: Record<string, string> = {
              Plant: 'Plant:',
              Port: 'Port:',
              'Quarry/Plant': 'Quarry/ Plant:',
              'Quarry/ Plant': 'Quarry/ Plant:',
              Employees: 'Employees:',
            };
            const headerText = headerMap[key] || `${key}:`;
            paragraphs.push(
              new Paragraph({
                children: [createTextRun(headerText, true)],
                alignment: AlignmentType.LEFT,
              }),
            );
          } else {
            paragraphs.push(
              new Paragraph({
                children: [createTextRun(`${key}:`, true)],
                alignment: AlignmentType.LEFT,
              }),
            );
          }
          const nested = value as Record<string, unknown>;
          for (const [nestedKey, nestedValue] of Object.entries(nested)) {
            paragraphs.push(
              new Paragraph({
                children: [
                  createTextRun(`•  ${nestedKey}: ${String(nestedValue)}`),
                ],
                alignment: AlignmentType.LEFT,
                indent: { left: 200 },
              }),
            );
          }
        } else {
          // Simple key-value pair
          if (needsHeaders) {
            const headerMap: Record<string, string> = {
              Plant: 'Plant:',
              Port: 'Port:',
              'Quarry/Plant': 'Quarry/ Plant:',
              'Quarry/ Plant': 'Quarry/ Plant:',
              Employees: 'Employees:',
            };
            const headerText = headerMap[key] || `${key}:`;
            paragraphs.push(
              new Paragraph({
                children: [createTextRun(headerText, true)],
                alignment: AlignmentType.LEFT,
              }),
            );
            paragraphs.push(
              new Paragraph({
                children: [createTextRun(String(value))],
                alignment: AlignmentType.LEFT,
                indent: { left: 200 },
              }),
            );
          } else {
            paragraphs.push(
              new Paragraph({
                children: [createTextRun(`${key}: ${String(value)}`)],
                alignment: AlignmentType.LEFT,
              }),
            );
          }
        }
      }
      return paragraphs;
    }

    return [
      new Paragraph({
        children: [createTextRun(String(spec))],
        alignment: AlignmentType.LEFT,
      }),
    ];
  };

  const checkmark = (v: boolean | undefined) => (v ? '✓' : '');

  // Process parameters array
  const params = section.parameters || [];

  for (const p of params) {
    const specParagraphs = formatSpecification(p.specification, p.name);
    const remarksParagraphs = formatSpecification(p.remarks);

    rows.push(
      new TableRow({
        children: [
          createLeftAlignedCell([createTextRun(p.name || '-')]),
          createLeftAlignedCell(specParagraphs),
          createCenteredCell(checkmark(p.withinSpecs === true)),
          createCenteredCell(checkmark(p.withinSpecs === false)),
          createLeftAlignedCell(remarksParagraphs),
        ],
      }),
    );
  }

  // Process otherComponents array
  const otherComponents = (section.otherComponents || []) as Array<{
    name?: string;
    specification?: unknown;
    withinSpecs?: boolean;
    remarks?: unknown;
  }>;

  for (const c of otherComponents) {
    const specParagraphs = formatSpecification(c.specification, c.name);
    const remarksParagraphs = formatSpecification(c.remarks);

    rows.push(
      new TableRow({
        children: [
          createLeftAlignedCell([createTextRun(c.name || 'Other Components')]),
          createLeftAlignedCell(specParagraphs),
          createCenteredCell(checkmark(c.withinSpecs === true)),
          createCenteredCell(checkmark(c.withinSpecs === false)),
          createLeftAlignedCell(remarksParagraphs),
        ],
      }),
    );
  }

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

  // Helper functions for consistent text formatting (Arial 11pt = 22 half-points)
  const createTextRun = (text: string, bold = false) => {
    return new TextRun({
      text,
      bold,
      font: 'Arial',
      size: 22, // 11pt
    });
  };

  // Cell padding in twips (5pt = 100 twips)
  const cellMargins = {
    top: 100,
    bottom: 100,
    left: 100,
    right: 100,
  };

  const createCenteredCell = (
    text: string,
    bold = false,
    opts: Record<string, unknown> = {},
  ) => {
    return new TableCell({
      children: [
        new Paragraph({
          children: [createTextRun(text, bold)],
          alignment: AlignmentType.CENTER,
        }),
      ],
      verticalAlign: VerticalAlign.CENTER,
      margins: cellMargins,
      ...opts,
    });
  };

  const createLeftAlignedCell = (
    text: string,
    bold = false,
    verticalAlignValue: string = VerticalAlign.CENTER,
    opts: Record<string, unknown> = {},
  ) => {
    return new TableCell({
      children: [
        new Paragraph({
          children: [createTextRun(text, bold)],
          alignment: AlignmentType.LEFT,
        }),
      ],
      verticalAlign: verticalAlignValue as any,
      margins: cellMargins,
      ...opts,
    });
  };

  const createLeftTopCell = (
    text: string,
    bold = false,
    opts: Record<string, unknown> = {},
  ) => {
    return createLeftAlignedCell(text, bold, VerticalAlign.TOP, opts);
  };

  const checkmark = (v: boolean | null | undefined) =>
    v === true ? '✓' : v === false ? '' : '';

  const rows: TableRow[] = [];

  // Header Row 1: Main headers with "Effective?" spanning 2 columns
  rows.push(
    new TableRow({
      children: [
        createCenteredCell('Project Impacts', true, {
          width: { size: 15, type: WidthType.PERCENTAGE },
          rowSpan: 2,
        }),
        createCenteredCell(
          'Mitigating Measures/ Control Strategies Planned',
          true,
          {
            width: { size: 35, type: WidthType.PERCENTAGE },
            rowSpan: 2,
          },
        ),
        createCenteredCell('Actual Observation', true, {
          width: { size: 25, type: WidthType.PERCENTAGE },
          rowSpan: 2,
        }),
        createCenteredCell('Effective?', true, {
          columnSpan: 2,
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
        createCenteredCell('Recommendations', true, {
          width: { size: 15, type: WidthType.PERCENTAGE },
          rowSpan: 2,
        }),
      ],
    }),
  );

  // Header Row 2: Y and N sub-columns only
  rows.push(
    new TableRow({
      children: [
        createCenteredCell('Y', true, {
          width: { size: 5, type: WidthType.PERCENTAGE },
        }),
        createCenteredCell('N', true, {
          width: { size: 5, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  );

  // Pre-Construction Section (if exists)
  const constructionInfo = section.constructionInfo || [];
  const preConstruction = constructionInfo.find((g) =>
    g.areaName?.toLowerCase().includes('pre-construction'),
  );

  if (preConstruction && preConstruction.commitments) {
    for (let i = 0; i < preConstruction.commitments.length; i++) {
      const c = preConstruction.commitments[i];
      if (i === 0) {
        // First row with rowSpan for areaName
        rows.push(
          new TableRow({
            children: [
              createCenteredCell('Pre-Construction', true, {
                rowSpan: preConstruction.commitments.length,
              }),
              createLeftTopCell(c.plannedMeasure || '-'),
              createLeftAlignedCell(c.actualObservation || '-'),
              createCenteredCell(checkmark(c.isEffective === true)),
              createCenteredCell(checkmark(c.isEffective === false)),
              createLeftAlignedCell(c.recommendations || '-'),
            ],
          }),
        );
      } else {
        // Subsequent rows without areaName (it's merged)
        rows.push(
          new TableRow({
            children: [
              createLeftTopCell(c.plannedMeasure || '-'),
              createLeftAlignedCell(c.actualObservation || '-'),
              createCenteredCell(checkmark(c.isEffective === true)),
              createCenteredCell(checkmark(c.isEffective === false)),
              createLeftAlignedCell(c.recommendations || '-'),
            ],
          }),
        );
      }
    }
  }

  // Construction Section (divider row with N/A spanning columns 2-5, empty Recommendations)
  const construction = constructionInfo.find(
    (g) =>
      g.areaName?.toLowerCase() === 'construction' &&
      !g.areaName?.toLowerCase().includes('pre'),
  );

  if (construction) {
    rows.push(
      new TableRow({
        children: [
          createCenteredCell('Construction', true),
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('N/A', false)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            columnSpan: 4,
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          createCenteredCell(''),
        ],
      }),
    );
  }

  // Implementation of Environmental Impact Control Strategies Section
  const implementation =
    section.implementationOfEnvironmentalImpactControlStrategies || [];

  if (implementation.length > 0) {
    // Divider row spanning columns 1-5, empty Recommendations
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createTextRun(
                    'Implementation of Environmental Impact Control Strategies',
                    true,
                  ),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            columnSpan: 5,
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          createCenteredCell(''),
        ],
      }),
    );

    // Process each area (e.g., "Quarry Operation")
    for (const group of implementation) {
      const commitments = group.commitments || [];
      if (commitments.length === 0) continue;

      // Add numbered items with vertical merge for areaName
      for (let i = 0; i < commitments.length; i++) {
        const c = commitments[i];
        const itemNumber = `${i + 1}. `;
        const plannedText = c.plannedMeasure
          ? `${itemNumber}${c.plannedMeasure}`
          : `${itemNumber}-`;

        if (i === 0) {
          // First row with rowSpan for areaName
          rows.push(
            new TableRow({
              children: [
                createCenteredCell(group.areaName || '-', true, {
                  rowSpan: commitments.length,
                }),
                createLeftTopCell(plannedText),
                createLeftAlignedCell(c.actualObservation || '-'),
                createCenteredCell(checkmark(c.isEffective === true)),
                createCenteredCell(checkmark(c.isEffective === false)),
                createLeftAlignedCell(c.recommendations || '-'),
              ],
            }),
          );
        } else {
          // Subsequent rows without areaName (it's merged)
          rows.push(
            new TableRow({
              children: [
                createLeftTopCell(plannedText),
                createLeftAlignedCell(c.actualObservation || '-'),
                createCenteredCell(checkmark(c.isEffective === true)),
                createCenteredCell(checkmark(c.isEffective === false)),
                createLeftAlignedCell(c.recommendations || '-'),
              ],
            }),
          );
        }
      }
    }
  }

  // Add Overall Compliance Assessment as last row if it exists
  if (section.overallComplianceAssessment) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createTextRun('Overall Compliance Assessment: ', true),
                  createTextRun(section.overallComplianceAssessment, false),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            columnSpan: 6,
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
        ],
      }),
    );
  }

  out.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createTableBorders(),
      rows,
    }),
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

  // NEW STRUCTURE: Use unified airQuality if present
  if ((air as any).airQuality) {
    // Build location name from enabled checkboxes and descriptions
    const labels: string[] = [];
    if ((air as any).quarryEnabled && typeof (air as any).quarry === 'string') {
      labels.push(`Quarry – ${(air as any).quarry}`);
    }
    if ((air as any).plantEnabled && typeof (air as any).plant === 'string') {
      labels.push(`Plant – ${(air as any).plant}`);
    }
    if (
      (air as any).quarryPlantEnabled &&
      typeof (air as any).quarryPlant === 'string'
    ) {
      labels.push(`Quarry/Plant – ${(air as any).quarryPlant}`);
    }
    if ((air as any).portEnabled && typeof (air as any).port === 'string') {
      labels.push(`Port – ${(air as any).port}`);
    }
    const locationName = labels.join('; ') || 'Air Quality Monitoring';
    out.push(...buildLocationTable((air as any).airQuality, locationName));
  }
  // OLD STRUCTURE: Render each location separately (backward compatibility)
  else {
    if (air.quarry && typeof air.quarry !== 'string') {
      out.push(...buildLocationTable(air.quarry, 'Quarry'));
    }
    if (air.plant && typeof air.plant !== 'string') {
      out.push(...buildLocationTable(air.plant, 'Plant'));
    }
    if (air.quarryAndPlant) {
      out.push(...buildLocationTable(air.quarryAndPlant, 'Quarry & Plant'));
    }
    if (air.port && typeof air.port !== 'string') {
      out.push(...buildLocationTable(air.port, 'Port'));
    }
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

    // Helper functions for consistent text formatting (Arial 11pt = 22 half-points)
    const createTextRun = (text: string, bold = false) => {
      return new TextRun({
        text,
        bold,
        font: 'Arial',
        size: 22, // 11pt
      });
    };

    // Cell padding in twips (5pt = 100 twips)
    const cellMargins = {
      top: 100,
      bottom: 100,
      left: 100,
      right: 100,
    };

    if (!locationData.parameters || locationData.parameters.length === 0) {
      return locationOut;
    }

    const locationLabel = locationData.locationDescription?.trim()
      ? `${locationName} – ${locationData.locationDescription}`
      : locationData.locationInput?.trim()
        ? `${locationName} – ${locationData.locationInput}`
        : locationName;

    // Add location label with left indentation (matching the image format)
    locationOut.push(
      new Paragraph({
        children: [
          new TextRun({
            text: locationLabel,
            font: 'Arial',
            size: 22, // 11pt
          }),
        ],
        indent: {
          left: 720, // 0.5 inch = 720 twips indentation from left
        },
        spacing: {
          before: 200, // Add space before
          after: 100, // Add space after
        },
      }),
    );

    const rows: TableRow[] = [];

    // Header Row 1: Top-level categories with merging
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          // Parameter - spans all 3 header rows
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Parameter', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 3,
            margins: cellMargins,
          }),
          // Result - spans 6 columns horizontally
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Result', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            columnSpan: 6,
            margins: cellMargins,
          }),
          // DENR Standard - spans 3 columns horizontally
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('DENR Standard', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            columnSpan: 3,
            margins: cellMargins,
          }),
          // Remark - spans all 3 header rows
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Remark', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 3,
            margins: cellMargins,
          }),
        ],
      }),
    );

    // Header Row 2: Mid-level breakdown
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          // Internal Monitoring - spans 4 columns
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Internal Monitoring', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            columnSpan: 4,
            margins: cellMargins,
          }),
          // MMT Confirmatory Sampling - spans 2 columns
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('MMT Confirmatory Sampling', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            columnSpan: 2,
            margins: cellMargins,
          }),
          // Red Flag - spans 2 rows
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Red Flag', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 2,
            margins: cellMargins,
          }),
          // Action - spans 2 rows
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Action', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 2,
            margins: cellMargins,
          }),
          // Limit mg/L - spans 2 rows
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Limit mg/L', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 2,
            margins: cellMargins,
          }),
        ],
      }),
    );

    // Header Row 3: Bottom-level specific headers
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          // Month
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Month', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          // Current (mg/L) - spans 2 columns
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Current (mg/L)', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            columnSpan: 2,
            margins: cellMargins,
          }),
          // Previous (mg/L) - spans 1 column (adjusted from image)
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Previous (mg/L)', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 8, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
          // Current (MMT)
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Current', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          // Previous (MMT)
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Previous', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
        ],
      }),
    );

    // Data rows
    locationData.parameters.forEach((p) => {
      const im = p.result?.internalMonitoring;
      const readings = im?.readings || [];
      const numReadings = readings.length > 0 ? readings.length : 1;

      // First row for this parameter (or only row if no readings)
      if (readings.length > 0) {
        readings.forEach((reading, index) => {
          const isFirstRow = index === 0;
          const cells: TableCell[] = [];

          // Parameter - vertically merged for all readings
          if (isFirstRow) {
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [createTextRun(p.name || '-', false)],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                rowSpan: numReadings,
                margins: cellMargins,
              }),
            );
          }

          // Month - vertically merged for all readings
          if (isFirstRow) {
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [createTextRun(im?.month || '-', false)],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                rowSpan: numReadings,
                margins: cellMargins,
              }),
            );
          }

          // Reading label (TSS 01, TSS 02, etc.) - Left aligned
          cells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [createTextRun(reading.label || '-', false)],
                  alignment: AlignmentType.LEFT,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
            }),
          );

          // Current mg/L value
          cells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    createTextRun(
                      reading.current_mgL != null
                        ? String(reading.current_mgL)
                        : '-',
                      false,
                    ),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
            }),
          );

          // Previous mg/L value
          cells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    createTextRun(
                      reading.previous_mgL != null
                        ? String(reading.previous_mgL)
                        : '-',
                      false,
                    ),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
            }),
          );

          // MMT Current - vertically merged for all readings
          if (isFirstRow) {
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      createTextRun(
                        p.result?.mmtConfirmatorySampling?.current || '-',
                        false,
                      ),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                rowSpan: numReadings,
                margins: cellMargins,
              }),
            );
          }

          // MMT Previous - vertically merged for all readings
          if (isFirstRow) {
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      createTextRun(
                        p.result?.mmtConfirmatorySampling?.previous || '-',
                        false,
                      ),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                rowSpan: numReadings,
                margins: cellMargins,
              }),
            );
          }

          // Red Flag - vertically merged for all readings
          if (isFirstRow) {
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      createTextRun(p.denrStandard?.redFlag || '-', false),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                rowSpan: numReadings,
                margins: cellMargins,
              }),
            );
          }

          // Action - vertically merged for all readings
          if (isFirstRow) {
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      createTextRun(p.denrStandard?.action || '-', false),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                rowSpan: numReadings,
                margins: cellMargins,
              }),
            );
          }

          // Limit - vertically merged for all readings
          if (isFirstRow) {
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      createTextRun(
                        p.denrStandard?.limit_mgL != null
                          ? String(p.denrStandard.limit_mgL)
                          : '-',
                        false,
                      ),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                rowSpan: numReadings,
                margins: cellMargins,
              }),
            );
          }

          // Remark - vertically merged for all readings
          if (isFirstRow) {
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [createTextRun(p.remark || '-', false)],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                rowSpan: numReadings,
                margins: cellMargins,
              }),
            );
          }

          rows.push(
            new TableRow({
              height: { value: 400, rule: 'atLeast' },
              children: cells,
            }),
          );
        });
      } else {
        // No readings - create a simple row
        rows.push(
          new TableRow({
            height: { value: 400, rule: 'atLeast' },
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [createTextRun(p.name || '-', false)],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: cellMargins,
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [createTextRun(im?.month || '-', false)],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: cellMargins,
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [createTextRun('-', false)],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: cellMargins,
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [createTextRun('-', false)],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: cellMargins,
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [createTextRun('-', false)],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: cellMargins,
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      createTextRun(
                        p.result?.mmtConfirmatorySampling?.current || '-',
                        false,
                      ),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: cellMargins,
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      createTextRun(
                        p.result?.mmtConfirmatorySampling?.previous || '-',
                        false,
                      ),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: cellMargins,
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      createTextRun(p.denrStandard?.redFlag || '-', false),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: cellMargins,
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      createTextRun(p.denrStandard?.action || '-', false),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: cellMargins,
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      createTextRun(
                        p.denrStandard?.limit_mgL != null
                          ? String(p.denrStandard.limit_mgL)
                          : '-',
                        false,
                      ),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: cellMargins,
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [createTextRun(p.remark || '-', false)],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
                margins: cellMargins,
              }),
            ],
          }),
        );
      }
    });

    // Full-width footer rows
    const totalColumns = 11; // Total physical columns in the table

    // Date/Time of sampling
    if (locationData.samplingDate) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    createTextRun(
                      `Date/ Time of sampling: ${locationData.samplingDate}`,
                      false,
                    ),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              ],
              columnSpan: totalColumns,
              margins: cellMargins,
            }),
          ],
        }),
      );
    }

    // Weather and wind direction
    if (locationData.weatherAndWind) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    createTextRun(
                      `Weather and wind direction: ${locationData.weatherAndWind}`,
                      false,
                    ),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              ],
              columnSpan: totalColumns,
              margins: cellMargins,
            }),
          ],
        }),
      );
    }

    // Explanation for confirmatory sampling
    if (locationData.explanationForConfirmatorySampling) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    createTextRun(
                      `Explanation of why confirmatory sampling was conducted for specific parameter in the sampling station: ${locationData.explanationForConfirmatorySampling}`,
                      false,
                    ),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              ],
              columnSpan: totalColumns,
              margins: cellMargins,
            }),
          ],
        }),
      );
    }

    // Overall Assessment
    if (locationData.overallAssessment) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    createTextRun('Overall Assessment: ', true),
                    createTextRun(locationData.overallAssessment, false),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              columnSpan: totalColumns,
              margins: cellMargins,
            }),
          ],
        }),
      );
    }

    locationOut.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: createTableBorders(),
        rows,
      }),
    );

    // Add spacing after table
    locationOut.push(
      new Paragraph({
        children: [new TextRun({ text: '' })],
        spacing: { before: 200, after: 200 },
      }),
    );

    return locationOut;
  };

  // Generate sections for each location
  // Handle new structure: waterQuality unified table with quarry/plant/quarryPlant as strings
  if (wq.waterQuality) {
    // Separate each location label and make label bold
    if (wq.quarryEnabled && wq.quarry) {
      const quarryLabel =
        typeof wq.quarry === 'string'
          ? `Quarry – ${wq.quarry}`
          : `Quarry – ${wq.quarry.locationDescription || ''}`;
      out.push(
        new Paragraph({
          children: [
            new TextRun({
              text: quarryLabel,
              bold: true,
              font: 'Arial',
              size: 22,
            }),
          ],
          spacing: { before: 200, after: 100 },
        }),
      );
    }
    if (wq.plantEnabled && wq.plant) {
      const plantLabel =
        typeof wq.plant === 'string'
          ? `Plant – ${wq.plant}`
          : `Plant – ${wq.plant.locationDescription || ''}`;
      out.push(
        new Paragraph({
          children: [
            new TextRun({
              text: plantLabel,
              bold: true,
              font: 'Arial',
              size: 22,
            }),
          ],
          spacing: { before: 200, after: 100 },
        }),
      );
    }
    if (wq.quarryPlantEnabled && wq.quarryPlant) {
      const qpLabel = `Quarry/Plant – ${wq.quarryPlant}`;
      out.push(
        new Paragraph({
          children: [
            new TextRun({ text: qpLabel, bold: true, font: 'Arial', size: 22 }),
          ],
          spacing: { before: 200, after: 100 },
        }),
      );
    }
    // Add the table after the labels
    out.push(...buildLocationTable(wq.waterQuality, ''));
  }

  // Legacy support: handle old structure where quarry/plant are objects
  if (wq.quarry && typeof wq.quarry !== 'string') {
    out.push(...buildLocationTable(wq.quarry, 'Quarry'));
  }
  if (wq.plant && typeof wq.plant !== 'string') {
    out.push(...buildLocationTable(wq.plant, 'Plant'));
  }
  if (wq.quarryAndPlant) {
    out.push(...buildLocationTable(wq.quarryAndPlant, 'Quarry/Plant'));
  }
  if (wq.port) {
    const portLabel = `Port – ${wq.port.locationDescription || wq.port.locationInput || ''}`;
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: portLabel,
            bold: true,
            font: 'Arial',
            size: 22,
          }),
        ],
        spacing: { before: 200, after: 100 },
      }),
    );
    out.push(...buildLocationTable(wq.port, 'Water Quality'));
  }

  return out;
}

export function createNoiseQualityTable(
  nq: NonNullable<CMVRGeneralInfo['noiseQualityImpactAssessment']>,
): Table {
  // Helper functions for consistent text formatting (Arial 11pt = 22 half-points)
  const createTextRun = (text: string, bold = false) => {
    return new TextRun({
      text,
      bold,
      font: 'Arial',
      size: 22, // 11pt
    });
  };

  // Cell padding in twips (5pt = 100 twips)
  const cellMargins = {
    top: 100,
    bottom: 100,
    left: 100,
    right: 100,
  };

  const rows: TableRow[] = [];

  // Header Row 1: Top-level categories with merging
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        // Parameter - spans all 3 header rows
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Parameter', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: 3,
          margins: cellMargins,
        }),
        // Results - spans 4 columns horizontally
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Results', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          columnSpan: 4,
          margins: cellMargins,
        }),
        // EQPL - spans 2 columns horizontally
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('EQPL', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          columnSpan: 2,
          margins: cellMargins,
        }),
        // DENR Standard Class C - Daytime - spans all 3 header rows
        new TableCell({
          children: [
            new Paragraph({
              children: [
                createTextRun('DENR Standard Class C - Daytime', true),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: 3,
          margins: cellMargins,
        }),
        // Remarks - spans all 3 header rows
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Remarks', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: 3,
          margins: cellMargins,
        }),
      ],
    }),
  );

  // Header Row 2: Mid-level breakdown
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        // In SMR - spans 2 columns
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('In SMR', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          columnSpan: 2,
          margins: cellMargins,
        }),
        // MMT Confirmatory Sampling - spans 2 columns
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('MMT Confirmatory Sampling', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          columnSpan: 2,
          margins: cellMargins,
        }),
        // Red Flag - spans 2 rows
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Red Flag', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: 2,
          margins: cellMargins,
        }),
        // Action - spans 2 rows
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Action', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          rowSpan: 2,
          margins: cellMargins,
        }),
      ],
    }),
  );

  // Header Row 3: Bottom-level specific headers
  rows.push(
    new TableRow({
      height: { value: 600, rule: 'atLeast' },
      children: [
        // Current (In SMR)
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Current', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
        // Previous (In SMR)
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Previous', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
        // Current (MMT)
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Current', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
        // Previous (MMT)
        new TableCell({
          children: [
            new Paragraph({
              children: [createTextRun('Previous', true)],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          margins: cellMargins,
        }),
      ],
    }),
  );

  // Data rows
  nq.parameters?.forEach((p) => {
    rows.push(
      new TableRow({
        height: { value: 400, rule: 'atLeast' },
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(p.name || '-', false)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createTextRun(p.results?.inSMR?.current || '-', false),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createTextRun(p.results?.inSMR?.previous || '-', false),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createTextRun(
                    p.results?.mmtConfirmatorySampling?.current || '-',
                    false,
                  ),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createTextRun(
                    p.results?.mmtConfirmatorySampling?.previous || '-',
                    false,
                  ),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(p.eqpl?.redFlag || '-', false)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(p.eqpl?.action || '-', false)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(p.eqpl?.denrStandard || '-', false)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun(p.remarks || '-', false)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
        ],
      }),
    );
  });

  // Full-width footer rows
  const totalColumns = 9; // Total physical columns in the table

  // Date/Time of sampling
  if (nq.samplingDate) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createTextRun(
                    `Date/ time of sampling: ${nq.samplingDate}`,
                    false,
                  ),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
            columnSpan: totalColumns,
            margins: cellMargins,
          }),
        ],
      }),
    );
  }

  // Weather and wind direction
  if (nq.weatherAndWind) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createTextRun(
                    `Weather and wind direction: ${nq.weatherAndWind}`,
                    false,
                  ),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
            columnSpan: totalColumns,
            margins: cellMargins,
          }),
        ],
      }),
    );
  }

  // Explanation for confirmatory sampling
  if (nq.explanationForConfirmatorySampling) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createTextRun(
                    `Explanation of why confirmatory sampling was conducted for specific parameter in the sampling station: ${nq.explanationForConfirmatorySampling}`,
                    false,
                  ),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
            columnSpan: totalColumns,
            margins: cellMargins,
          }),
        ],
      }),
    );
  }

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

  // Helper functions for consistent text formatting (Arial 11pt = 22 half-points)
  const createTextRun = (text: string, bold = false) => {
    return new TextRun({
      text,
      bold,
      font: 'Arial',
      size: 22, // 11pt
    });
  };

  // Cell padding in twips (5pt = 100 twips)
  const cellMargins = {
    top: 100,
    bottom: 100,
    left: 100,
    right: 100,
  };

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

    // Add location label with left indentation
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: label.toUpperCase(),
            bold: true,
            font: 'Arial',
            size: 22, // 11pt
          }),
        ],
        spacing: { before: 200, after: 100 },
        alignment: AlignmentType.CENTER,
      }),
    );

    if (typeof data === 'string') {
      out.push(createParagraph(data));
      return;
    }

    const rows: TableRow[] = [];

    // Header Row 1: Nested headers with horizontal merging
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          // Type of Waste - single row, no merging - WIDER
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Type of Waste', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 2,
            width: { size: 18, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
          // ECC/EPEP Commitments - spans 3 columns - NARROWER
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('ECC/ EPEP Commitments', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            columnSpan: 3,
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
          // Adequate - spans 2 columns
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Adequate', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            columnSpan: 2,
            width: { size: 12, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
          // Previous Record - single row, no merging
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Previous Record', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 2,
            width: { size: 15, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
          // Q2 2025 Generated HW - single row, no merging
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Q2 2025 Generated HW', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 2,
            width: { size: 12, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
          // Total - single row, no merging - WIDER
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Total', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            rowSpan: 2,
            width: { size: 13, type: WidthType.PERCENTAGE },
            margins: cellMargins,
          }),
        ],
      }),
    );

    // Header Row 2: Sub-columns for ECC/EPEP Commitments and Adequate
    rows.push(
      new TableRow({
        height: { value: 600, rule: 'atLeast' },
        children: [
          // Handling
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Handling', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          // Storage
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Storage', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          // Disposal
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Disposal', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          // Y
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('Y', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
          // N
          new TableCell({
            children: [
              new Paragraph({
                children: [createTextRun('N', true)],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: cellMargins,
          }),
        ],
      }),
    );

    // Data rows
    data.forEach((row) => {
      rows.push(
        new TableRow({
          height: { value: 400, rule: 'atLeast' },
          children: [
            // Type of Waste - Centered
            new TableCell({
              children: [
                new Paragraph({
                  children: [createTextRun(row.typeOfWaste || '-', false)],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
            }),
            // Handling - Centered (leave blank if empty)
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    createTextRun(
                      row.eccEpepCommitments?.handling || '',
                      false,
                    ),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
            }),
            // Storage - Centered
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    createTextRun(row.eccEpepCommitments?.storage || '', false),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
            }),
            // Disposal - Centered (leave blank if empty)
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    createTextRun(
                      row.eccEpepCommitments?.disposal ? '✓' : '',
                      false,
                    ),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
            }),
            // Y (Adequate) - Centered checkmark
            new TableCell({
              children: [
                new Paragraph({
                  children: [createTextRun(row.adequate?.y ? '✓' : '', false)],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
            }),
            // N (Adequate) - Centered checkmark
            new TableCell({
              children: [
                new Paragraph({
                  children: [createTextRun(row.adequate?.n ? '✓' : '', false)],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
            }),
            // Previous Record - Centered
            new TableCell({
              children: [
                new Paragraph({
                  children: [createTextRun(toStr(row.previousRecord), false)],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
            }),
            // Q2 2025 Generated HW - Centered
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    createTextRun(toStr(row.q2_2025_Generated_HW), false),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
            }),
            // Total - Centered
            new TableCell({
              children: [
                new Paragraph({
                  children: [createTextRun(toStr(row.total), false)],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: cellMargins,
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

    // Add spacing after table
    out.push(
      new Paragraph({
        children: [new TextRun({ text: '' })],
        spacing: { before: 200, after: 200 },
      }),
    );
  };

  // Build each section with line breaks between them
  build('Quarry', section.quarry);

  // Add line break between sections
  if (section.quarry && section.plant) {
    out.push(
      new Paragraph({
        children: [new TextRun({ text: '' })],
        spacing: { before: 400, after: 0 },
      }),
    );
  }

  build('Plant', section.plant);

  // Add line break between sections
  if (section.plant && section.port) {
    out.push(
      new Paragraph({
        children: [new TextRun({ text: '' })],
        spacing: { before: 400, after: 0 },
      }),
    );
  }

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

    nq.plant?.forEach((p, index) => {
      rows.push(
        new TableRow({
          height: { value: 600, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                createParagraph(
                  `${index + 1}. ${p.recommendation || 'N/A'}`,
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

    nq.quarry?.forEach((p, index) => {
      rows.push(
        new TableRow({
          height: { value: 600, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                createParagraph(
                  `${index + 1}. ${p.recommendation || 'N/A'}`,
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

    nq.port?.forEach((p, index) => {
      rows.push(
        new TableRow({
          height: { value: 600, rule: 'atLeast' },
          children: [
            new TableCell({
              children: [
                createParagraph(
                  `${index + 1}. ${p.recommendation || 'N/A'}`,
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
              createParagraph(chemicalText, false, AlignmentType.CENTER),
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

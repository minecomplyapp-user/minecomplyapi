import { Injectable } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  VerticalAlign,
} from 'docx';
import type { CMVRGeneralInfo } from '../cmvr-pdf-generator.service';
import { createFundTable, createTableBorders, createText, createParagraph,createKeyValueTable } from './general-use.helper';

import { func } from 'joi';

 export function createComplianceToProjectLocationTable(
    section: NonNullable<
      CMVRGeneralInfo['complianceToProjectLocationAndCoverageLimits']
    >,
  ): Table {
    const rows: TableRow[] = [];
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [createParagraph('Parameter', true)],
          }),
          new TableCell({
            children: [createParagraph('Specification', true)],
          }),
          new TableCell({
            children: [createParagraph('Within Specs', true)],
          }),
          new TableCell({ children: [createParagraph('Remarks', true)] }),
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
          children: [
            new TableCell({ children: [createParagraph(p.name || '-')] }),
            new TableCell({
              children: [createParagraph(toStr(p.specification))],
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.withinSpecs ? 'Yes' : p.withinSpecs === false ? 'No' : '-',
                ),
              ],
            }),
            new TableCell({
              children: [createParagraph(toStr(p.remarks))],
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
          children: [
            new TableCell({
              children: [createParagraph(c.name || 'Other Components')],
            }),
            new TableCell({
              children: [createParagraph(toStr(c.specification))],
            }),
            new TableCell({
              children: [
                createParagraph(
                  c.withinSpecs ? 'Yes' : c.withinSpecs === false ? 'No' : '-',
                ),
              ],
            }),
            new TableCell({
              children: [createParagraph(toStr(c.remarks))],
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
          children: [
            new TableCell({
              children: [createParagraph('Area Name', true)],
            }),
            new TableCell({
              children: [createParagraph('Planned Measure', true)],
            }),
            new TableCell({
              children: [createParagraph('Actual Observation', true)],
            }),
            new TableCell({
              children: [createParagraph('Effective', true)],
            }),
            new TableCell({
              children: [createParagraph('Recommendations', true)],
            }),
          ],
        }),
      );
      for (const g of groups) {
        for (const c of g.commitments || []) {
          rows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [createParagraph(g.areaName || '-')],
                }),
                new TableCell({
                  children: [createParagraph(c.plannedMeasure || '-')],
                }),
                new TableCell({
                  children: [createParagraph(c.actualObservation || '-')],
                }),
                new TableCell({
                  children: [
                    createParagraph(
                      c.isEffective === null
                        ? '-'
                        : c.isEffective
                          ? 'Yes'
                          : 'No',
                    ),
                  ],
                }),
                new TableCell({
                  children: [createParagraph(c.recommendations || '-')],
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
        children: [
          new TableCell({
            children: [createParagraph('Parameter', true)],
          }),
          new TableCell({
            children: [createParagraph('In SMR (Current)', true)],
          }),
          new TableCell({
            children: [createParagraph('In SMR (Previous)', true)],
          }),
          new TableCell({
            children: [createParagraph('Confirmatory (Current)', true)],
          }),
          new TableCell({
            children: [createParagraph('Confirmatory (Previous)', true)],
          }),
          new TableCell({ children: [createParagraph('Red Flag', true)] }),
          new TableCell({ children: [createParagraph('Action', true)] }),
          new TableCell({ children: [createParagraph('Limit', true)] }),
          new TableCell({ children: [createParagraph('Remarks', true)] }),
        ],
      }),
    );
    air.parameters?.forEach((p) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [createParagraph(p.name || '-')] }),
            new TableCell({
              children: [
                createParagraph(p.results?.inSMR?.current || '-'),
              ],
            }),
            new TableCell({
              children: [
                createParagraph(p.results?.inSMR?.previous || '-'),
              ],
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.results?.mmtConfirmatorySampling?.current || '-',
                ),
              ],
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.results?.mmtConfirmatorySampling?.previous || '-',
                ),
              ],
            }),
            new TableCell({
              children: [createParagraph(p.eqpl?.redFlag || '-')],
            }),
            new TableCell({
              children: [createParagraph(p.eqpl?.action || '-')],
            }),
            new TableCell({
              children: [createParagraph(p.eqpl?.limit || '-')],
            }),
            new TableCell({
              children: [createParagraph(p.remarks || '-')],
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
      out.push(
        createParagraph(`Overall Assessment: ${air.overallAssessment}`),
      );
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
          children: [
            new TableCell({
              children: [createParagraph('Parameter', true)],
            }),
            new TableCell({
              children: [createParagraph('Internal Monitoring', true)],
            }),
            new TableCell({
              children: [
                createParagraph('Confirmatory (Current/Prev)', true),
              ],
            }),
            new TableCell({
              children: [createParagraph('DENR Red Flag', true)],
            }),
            new TableCell({
              children: [createParagraph('DENR Action', true)],
            }),
            new TableCell({
              children: [createParagraph('DENR Limit (mg/L)', true)],
            }),
            new TableCell({ children: [createParagraph('Remark', true)] }),
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
            children: [
              new TableCell({
                children: [createParagraph(p.name || '-')],
              }),
              new TableCell({ children: [createParagraph(imText)] }),
              new TableCell({ children: [createParagraph(confirm)] }),
              new TableCell({
                children: [
                  createParagraph(p.denrStandard?.redFlag || '-'),
                ],
              }),
              new TableCell({
                children: [createParagraph(p.denrStandard?.action || '-')],
              }),
              new TableCell({
                children: [
                  createParagraph(
                    p.denrStandard?.limit_mgL != null
                      ? String(p.denrStandard.limit_mgL)
                      : '-',
                  ),
                ],
              }),
              new TableCell({
                children: [createParagraph(p.remark || '-')],
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
      out.push(
        createParagraph(`Overall Assessment: ${wq.overallAssessment}`),
      );
    return out;
  }

  export function createNoiseQualityTable(
    nq: NonNullable<CMVRGeneralInfo['noiseQualityImpactAssessment']>,
  ): Table {
    const rows: TableRow[] = [];
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [createParagraph('Parameter', true)],
          }),
          new TableCell({
            children: [createParagraph('In SMR (Current)', true)],
          }),
          new TableCell({
            children: [createParagraph('In SMR (Previous)', true)],
          }),
          new TableCell({
            children: [createParagraph('Confirmatory (Current)', true)],
          }),
          new TableCell({
            children: [createParagraph('Confirmatory (Previous)', true)],
          }),
          new TableCell({ children: [createParagraph('Red Flag', true)] }),
          new TableCell({ children: [createParagraph('Action', true)] }),
          new TableCell({
            children: [createParagraph('DENR Standard', true)],
          }),
          new TableCell({ children: [createParagraph('Remarks', true)] }),
        ],
      }),
    );
    nq.parameters?.forEach((p) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [createParagraph(p.name || '-')] }),
            new TableCell({
              children: [
                createParagraph(p.results?.inSMR?.current || '-'),
              ],
            }),
            new TableCell({
              children: [
                createParagraph(p.results?.inSMR?.previous || '-'),
              ],
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.results?.mmtConfirmatorySampling?.current || '-',
                ),
              ],
            }),
            new TableCell({
              children: [
                createParagraph(
                  p.results?.mmtConfirmatorySampling?.previous || '-',
                ),
              ],
            }),
            new TableCell({
              children: [createParagraph(p.eqpl?.redFlag || '-')],
            }),
            new TableCell({
              children: [createParagraph(p.eqpl?.action || '-')],
            }),
            new TableCell({
              children: [createParagraph(p.eqpl?.denrStandard || '-')],
            }),
            new TableCell({
              children: [createParagraph(p.remarks || '-')],
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
          children: [
            new TableCell({
              children: [createParagraph('Type of Waste', true)],
            }),
            new TableCell({
              children: [createParagraph('ECC/EPEP Handling', true)],
            }),
            new TableCell({
              children: [createParagraph('ECC/EPEP Storage', true)],
            }),
            new TableCell({
              children: [createParagraph('ECC/EPEP Disposal', true)],
            }),
            new TableCell({
              children: [createParagraph('Adequate (Y/N)', true)],
            }),
            new TableCell({
              children: [createParagraph('Previous Record', true)],
            }),
            new TableCell({
              children: [createParagraph('Q2 2025 Generated HW', true)],
            }),
            new TableCell({ children: [createParagraph('Total', true)] }),
          ],
        }),
      );
      data.forEach((row) => {
        rows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [createParagraph(row.typeOfWaste || '-')],
              }),
              new TableCell({
                children: [
                  createParagraph(row.eccEpepCommitments?.handling || '-'),
                ],
              }),
              new TableCell({
                children: [
                  createParagraph(row.eccEpepCommitments?.storage || '-'),
                ],
              }),
              new TableCell({
                children: [
                  createParagraph(
                    row.eccEpepCommitments?.disposal ? 'Yes' : 'No',
                  ),
                ],
              }),
              new TableCell({
                children: [
                  createParagraph(
                    row.adequate?.y ? 'Y' : row.adequate?.n ? 'N' : '-',
                  ),
                ],
              }),
              new TableCell({
                children: [createParagraph(toStr(row.previousRecord))],
              }),
              new TableCell({
                children: [
                  createParagraph(toStr(row.q2_2025_Generated_HW)),
                ],
              }),
              new TableCell({
                children: [createParagraph(toStr(row.total))],
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
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


export function createGeneralInfoKeyValues(
    generalInfo: CMVRGeneralInfo,
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Company Name (bold, Arial 11pt)
    if (generalInfo.companyName) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: generalInfo.companyName,
              bold: true,
              font: 'Arial',
              size: 22, // 11pt
              color: '000000',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    // Location
    const locationStr =
      typeof generalInfo.location === 'string'
        ? generalInfo.location
        : generalInfo.location
          ? `Lat: ${generalInfo.location.latitude}, Long: ${generalInfo.location.longitude}`
          : '';

    if (locationStr) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: locationStr,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    // Quarter and Year
    if (generalInfo.quarter || generalInfo.year) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Quarter: ${generalInfo.quarter || 'N/A'} ${generalInfo.year || ''}`,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    // Dates
    if (generalInfo.dateOfComplianceMonitoringAndValidation) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Date of Compliance Monitoring and Validation: ${generalInfo.dateOfComplianceMonitoringAndValidation}`,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    if (generalInfo.monitoringPeriodCovered) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Monitoring Period Covered: ${generalInfo.monitoringPeriodCovered}`,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          spacing: { after: 100 },
        }),
      );
    }

    if (generalInfo.dateOfCmrSubmission) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Date of CMR Submission: ${generalInfo.dateOfCmrSubmission}`,
              font: 'Arial',
              size: 22,
              color: '000000',
            }),
          ],
          spacing: { after: 200 },
        }),
      );
    }

    return paragraphs;
  }

/**
 * Creates valid ECC test data that passes all DTO validation rules
 * @param overrides Optional partial data to override defaults
 * @returns Complete ECC data structure
 */
export function createValidECCData(overrides?: any): any {
  const defaultData: any = {
    generalInfo: {
      companyName: 'Test Mining Company',
      location: 'Test Location',
      quarter: 'Q1',
      year: 2025,
    },
    mmtInfo: {
      head: 'Test MMT Head',
      members: ['Member 1', 'Member 2'],
    },
    permit_holders: ['Test Permit Holder 1'],
    conditions: [
      {
        condition: 'Test Condition 1',
        condition_number: 1,
        status: 'Complied',
        section: 1,
        remarks: 'Test remarks',
      },
    ],
    remarks_list: {},
    recommendations: [],
  };

  // Simple deep merge
  return deepMerge(defaultData, overrides || {});
}

function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

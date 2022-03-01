import { AzureFunction, Context } from '@azure/functions';
import fetch from 'node-fetch';
import { addItem, init } from './lib/table';

enum ParkingCode {
  Ground1 = 3,
  Ground2 = 15,
  Underground = 12,
}

interface ParkingData {
  areaCode: ParkingCode;
  areaFreeSpaceNum: number;
}

interface ParkingResponse {
  success: boolean;
  msparkingData: ParkingData[];
}

const excludeParking = new Set([ParkingCode.Ground1]);

const getParkingResources: AzureFunction = async function (context: Context): Promise<void> {
  await init();

  try {
    const response = await fetch('http://ms.suzhouparking.kingfaster.com.cn/ParkingSpaceApi/GetData').then(data => data.json()) as ParkingResponse;
    if (!response.success) {
      context.log(JSON.stringify(response));
      return;
    }
    const parkingData = response.msparkingData.filter(({ areaCode }) => !excludeParking.has(areaCode));

    const ground = parkingData.filter(({ areaCode }) => areaCode === ParkingCode.Ground2)[0]?.areaFreeSpaceNum ?? 0;
    const underground = parkingData.filter(({ areaCode }) => areaCode === ParkingCode.Underground)[0]?.areaFreeSpaceNum ?? 0;

    await addItem(ground, underground);
  } catch (ex) {
    context.done(ex);
    return;
  }
};

export default getParkingResources;

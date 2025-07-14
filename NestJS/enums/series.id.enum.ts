import { registerEnumType } from '@nestjs/graphql';

export enum SeriesIdEnum {
  IPL_2024 = '7607',
  ICC_MEN_T20_WC_24 = '7476',
}

registerEnumType(SeriesIdEnum, {
  name: 'SeriesIdEnum',
});

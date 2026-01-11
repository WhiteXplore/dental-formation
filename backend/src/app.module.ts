import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HttpModule } from '@nestjs/axios';
import { PatientModule } from './patient/patient.module';

import { DentalChartModule } from './dental-chart/dental-chart.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PaymentModule } from './payment/payment.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { InventoryModule } from './inventory/inventory.module';
import { PrescribeMedicationModule } from './prescribe-medication/prescribe-medication.module';
import { PriceProcedureModule } from './price-procedure/price-procedure.module';
import { HmoGuarantorsModule } from './hmo-guarantors/hmo-guarantors.module';
import { RevenueModule } from './revenue/revenue.module';
import { ForecastModule } from './forecast/forecast.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // loads .env and makes process.env available
    }),
    HttpModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '3306', 10),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    AuthModule,
    UserModule,
    PatientModule,

    DentalChartModule,
    AppointmentModule,
    PaymentModule,
    PrescriptionModule,
    InventoryModule,
    PrescribeMedicationModule,
    PriceProcedureModule,
    HmoGuarantorsModule,
    RevenueModule,
    ForecastModule,
  ],
})
export class AppModule {}

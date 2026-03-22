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
import { StatusModule } from './status/status.module';
import { MedicinesModule } from './medicines/medicines.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // loads .env and makes process.env available
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306', 10),
      username: 'root',
      password: 'admin12345..',
      database: 'dental_formation',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: process.env.DATABASE_HOST,
    //   port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    //   username: 'root',
    //   password: 'admin12345..',
    //   database: 'dental_formation',
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true,
    // }),

    HttpModule,
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
    StatusModule,
    MedicinesModule,
  ],
})
export class AppModule {}

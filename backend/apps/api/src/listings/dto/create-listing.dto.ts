import { IsString, IsNumber, IsUrl, IsOptional, MaxLength } from 'class-validator';

export class CreateListingDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsUrl({ require_tld: false }) // false biar bisa pake localhost pas testing
  endpoint!: string;

  @IsString()
  price_wei!: string; // Tipe string karena Wei nilainya sangat besar (BigInt)

  @IsString()
  schema_input!: string; // JSON Schema dalam bentuk string

  @IsString()
  schema_output!: string; // JSON Schema dalam bentuk string

  @IsNumber()
  @IsOptional()
  timeout_ms?: number; // Opsional, default misal 5000 (5 detik)
}

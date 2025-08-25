import { IsString, IsArray, IsOptional } from 'class-validator';

export class TextDto {
  @IsString()
  text: string;
}

export class TranslationDto {
  @IsString()
  text: string;

  @IsString()
  targetLang: string;
}

export class StoryDto {
  @IsString()
  theme: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}

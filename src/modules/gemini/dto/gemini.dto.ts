import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TextDto {
  @ApiProperty({ description: '처리할 텍스트', example: '안녕하세요. 오늘 날씨가 좋네요.' })
  @IsString()
  text: string;
}

export class TranslationDto {
  @ApiProperty({ description: '번역할 텍스트', example: '안녕하세요. 오늘 날씨가 좋네요.' })
  @IsString()
  text: string;

  @ApiProperty({ description: '목표 언어', example: 'English' })
  @IsString()
  targetLang: string;
}

export class StoryDto {
  @ApiProperty({ description: '이야기 주제', example: '우주 모험' })
  @IsString()
  theme: string;

  @ApiProperty({ description: '포함할 키워드 (선택사항)', example: ['우주선', '외계인', '모험'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}

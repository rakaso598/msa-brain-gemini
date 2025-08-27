import { IsString, IsArray, IsOptional, IsUrl } from 'class-validator';
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

export class PortfolioAnalysisDto {
  @ApiProperty({
    description: '분석할 GitHub 저장소 URL',
    example: 'https://github.com/rakaso598/msa-self-dashboard-gemini'
  })
  @IsString()
  @IsUrl({}, { message: 'GitHub URL은 유효한 URL 형식이어야 합니다.' })
  githubUrl: string;

  @ApiProperty({
    description: '분석할 블로그 게시물 URL (선택사항)',
    example: 'https://your-blog.tistory.com/post/123',
    required: false
  })
  @IsOptional()
  @IsUrl({}, { message: 'Blog URL은 유효한 URL 형식이어야 합니다.' })
  blogUrl?: string;

  @ApiProperty({
    description: '이력서 내용 텍스트 (선택사항)',
    example: '개인 이력서 내용을 텍스트로 붙여넣습니다.',
    required: false
  })
  @IsOptional()
  @IsString()
  resumeText?: string;
}

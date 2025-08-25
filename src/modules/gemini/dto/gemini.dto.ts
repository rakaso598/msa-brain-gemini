import { ApiProperty } from '@nestjs/swagger';

export class SummarizeDto {
  @ApiProperty({
    description: '요약할 텍스트 내용',
    example: '인공지능은 컴퓨터가 인간의 지능을 모방하여 학습하고 추론하며 문제를 해결하는 기술입니다. 머신러닝, 딥러닝, 자연어처리 등 다양한 분야로 구성되어 있으며, 현재 의료, 금융, 교육, 자율주행 등 여러 산업에서 활용되고 있습니다. 앞으로도 인공지능 기술의 발전은 우리 생활에 더 큰 변화를 가져올 것으로 예상됩니다.',
    minLength: 1,
    maxLength: 10000
  })
  text: string;
}

export class AnalyzeSentimentDto {
  @ApiProperty({
    description: '감정을 분석할 텍스트 내용',
    example: '오늘 정말 기분이 좋다! 새로운 프로젝트가 성공적으로 마무리되어서 너무 뿌듯하다.',
    minLength: 1,
    maxLength: 5000
  })
  text: string;
}

export class GenerateResponseDto {
  @ApiProperty({
    description: '질문 또는 요청 내용',
    example: 'NestJS의 주요 장점과 특징에 대해 설명해주세요.',
    minLength: 1,
    maxLength: 1000
  })
  query: string;
}

export class SuccessResponseDto {
  @ApiProperty({
    description: '요청 처리 성공 여부',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: '응답 생성 시간',
    example: '2025-08-25T02:30:00.000Z'
  })
  timestamp: string;
}

export class SummarizeResponseDto extends SuccessResponseDto {
  @ApiProperty({
    description: '텍스트 요약 결과 및 키워드',
    example: '인공지능은 인간의 지능을 모방하는 컴퓨터 기술입니다.\n머신러닝, 딥러닝 등으로 구성되며 의료, 금융 등에서 활용됩니다.\n앞으로 우리 생활에 더 큰 변화를 가져올 전망입니다.\n\n키워드: 인공지능, 머신러닝, 기술혁신'
  })
  summary: string;
}

export class SentimentResponseDto extends SuccessResponseDto {
  @ApiProperty({
    description: '감정 분석 결과',
    example: '긍정\n\n프로젝트 성공과 뿌듯함을 표현하는 긍정적인 감정이 드러나는 문장입니다.'
  })
  sentiment: string;
}

export class GenerateResponseResponseDto extends SuccessResponseDto {
  @ApiProperty({
    description: '생성된 응답',
    example: 'NestJS는 Node.js 기반의 프레임워크로 다음과 같은 장점이 있습니다:\n\n1. 모듈화된 아키텍처: 애플리케이션을 모듈 단위로 구성하여 확장성과 유지보수성이 뛰어납니다.\n2. TypeScript 지원: 강력한 타입 시스템으로 개발 생산성과 코드 품질을 향상시킵니다.\n3. 데코레이터 패턴: 직관적이고 선언적인 코딩이 가능합니다.\n4. 의존성 주입: 테스트하기 쉽고 유연한 코드 작성이 가능합니다.\n5. Express 기반: 빠른 성능과 풍부한 생태계를 활용할 수 있습니다.'
  })
  response: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: '오류 메시지',
    example: '텍스트 필드가 필요합니다.'
  })
  message: string;
}

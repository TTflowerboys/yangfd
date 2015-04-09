//
//  CUTECityEnum.h
//  currant
//
//  Created by Foster Yin on 4/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEEnum.h"

@interface CUTECityEnum : CUTEEnum

@property (strong, nonatomic) CUTEEnum *country;

+ (CUTECityEnum *)cityWithValue:(NSString *)value;


@end

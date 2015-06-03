//
//  CUTETimePeriod.h
//  currant
//
//  Created by Foster Yin on 6/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "MTLModel.h"

@interface CUTETimePeriod : MTLModel

@property (strong, nonatomic) NSString *unit;

@property (nonatomic) float value;

+ (CUTETimePeriod *)timePeriodWithValue:(float)value unit:(NSString *)unit;

- (NSDictionary *)toParams;

@end

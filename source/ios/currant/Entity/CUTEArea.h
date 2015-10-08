//
//  CUTEArea.h
//  currant
//
//  Created by Foster Yin on 4/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Mantle.h>

@interface CUTEArea : MTLModel <MTLJSONSerializing>

@property (strong, nonatomic) NSString *unit;

@property (strong, nonatomic) NSString *value;

+ (CUTEArea *)areaWithValue:(NSString *)value unit:(NSString *)unit;

- (NSString *)unitPresentation;

- (NSDictionary *)toParams;

@end

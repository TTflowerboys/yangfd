//
//  CUTEI18n.h
//  currant
//
//  Created by Foster Yin on 4/9/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "MTLModel.h"

@interface CUTEI18n : MTLModel

@property (strong, nonatomic) NSString *locale;

@property (strong, nonatomic) NSString *value;

- (NSDictionary *)toParams;

+ (CUTEI18n *)i18nWithValue:(NSString *)value;

@end

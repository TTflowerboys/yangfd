//
//  CUTEI18n.m
//  currant
//
//  Created by Foster Yin on 4/9/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEI18n.h"
#import "CUTECommonMacro.h"

@implementation CUTEI18n

- (NSString *)locale {
    if (!_locale) {
        return DEFAULT_I18N_LOCALE;
    }
    return _locale;
}

- (NSDictionary *)toParams {
    if (self.value){
        return @{self.locale: self.value};
    }
    return nil;
}

+ (CUTEI18n *)i18nWithValue:(NSString *)value {
    CUTEI18n *i18n = [[CUTEI18n alloc] init];
    i18n.value = value;
    return i18n;
}

@end

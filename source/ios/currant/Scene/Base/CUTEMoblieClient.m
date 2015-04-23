//
//  CUTEMoblieClient.m
//  currant
//
//  Created by Foster Yin on 4/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEMoblieClient.h"
#import "CUTECommonMacro.h"
#import "CUTEDataManager.h"

@implementation CUTEMoblieClient

- (void)log:(JSValue *)message {
    DebugLog(@"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,message);

}

- (void)signIn:(JSValue *)result {

    [[CUTEDataManager sharedInstance] saveAllCookies];
    NSDictionary *dic = [result toDictionary];
    if (dic && [dic isKindOfClass:[NSDictionary class]]) {
        CUTEUser *user = (CUTEUser *)[MTLJSONAdapter modelOfClass:[CUTEUser class] fromJSONDictionary:dic error:nil];
        [[CUTEDataManager sharedInstance] saveUser:user];
    }
}

- (void)logOut {
    [[CUTEDataManager sharedInstance] cleanAllCookies];
    [[CUTEDataManager sharedInstance] cleanUser];
}

@end

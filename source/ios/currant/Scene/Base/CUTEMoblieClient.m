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
#import "CUTETicket.h"
#import "CUTEPropertyInfoViewController.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTEEnumManager.h"
#import "CUTENotificationKey.h"

@implementation CUTEMoblieClient

- (void)log:(JSValue *)message {
    DebugLog(@"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,message);

}

- (void)signIn:(JSValue *)result {
    NSDictionary *dic = [result toDictionary];
    if (dic && [dic isKindOfClass:[NSDictionary class]]) {
        NSError *error = nil;
        CUTEUser *user = (CUTEUser *)[MTLJSONAdapter modelOfClass:[CUTEUser class] fromJSONDictionary:dic error:&error];
        if (!error && user) {
            [[CUTEDataManager sharedInstance] saveAllCookies];
            [[CUTEDataManager sharedInstance] saveUser:user];
        }
    }
}

- (void)logOut {
    [[CUTEDataManager sharedInstance] cleanAllCookies];
    [[CUTEDataManager sharedInstance] cleanUser];
}

- (void)editRentTicket:(JSValue *)result {
    NSDictionary *dic = [result toDictionary];
    if (dic && [dic isKindOfClass:[NSDictionary class]]) {
        NSError *error = nil;
        CUTETicket *ticket = (CUTETicket *)[MTLJSONAdapter modelOfClass:[CUTETicket class] fromJSONDictionary:dic error:&error];
        if (!error && ticket) {
            [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_EDIT object:self.controller userInfo:@{@"ticket": ticket}];
        }
    }
}

- (void)wechatShareRentTicket:(JSValue *)result {
    NSDictionary *dic = [result toDictionary];
    if (dic && [dic isKindOfClass:[NSDictionary class]]) {
        NSError *error = nil;
        CUTETicket *ticket = (CUTETicket *)[MTLJSONAdapter modelOfClass:[CUTETicket class] fromJSONDictionary:dic error:&error];
        if (!error && ticket) {
            [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_WECHAT_SHARE object:self.controller userInfo:@{@"ticket": ticket}];
        }
    }
}

@end

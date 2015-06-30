//
//  KIFTestActor+Login.m
//  currant
//
//  Created by Foster Yin on 6/30/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "KIFTestActor+Login.h"
#import "CUTEDataManager.h"
#import "CUTENotificationKey.h"
#import "CUTECommonMacro.h"

@implementation KIFTestActor (Login)

- (void)logout {
    [[CUTEDataManager sharedInstance] clearAllCookies];
    [[CUTEDataManager sharedInstance] clearUser];
    [NotificationCenter postNotificationName:KNOTIF_USER_DID_LOGOUT object:nil];
}

@end

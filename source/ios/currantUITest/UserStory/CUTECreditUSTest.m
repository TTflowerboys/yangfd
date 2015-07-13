//
//  CUTECreditUSTest.m
//  currant
//
//  Created by Foster Yin on 7/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import "CUTECommonMacro.h"
#import "KIFUITestActor+Login.h"
#import "CUTEAPIManager.h"
#import "CUTECredit.h"
#import "NSArray+ObjectiveSugar.h"


SpecBegin(CreditUS)

describe(@"AppCredit", ^ {

    beforeAll(^{
        [tester logout];
        [tester login];

    });

    it(@"should have init credit", ^ {
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/credit/view_rent_ticket_contact_info/amount" parameters:nil resultClass:[CUTECredit class] resultKeyPath:@"val.credits"] continueWithBlock:^id(BFTask *task) {
           CUTECredit *initCredit = [task.result detect:^BOOL(CUTECredit *object) {
                   return [object.tag isEqualToString:@"initial"];
               }];
            assertThat(initCredit, notNilValue());
            assertThat(initCredit.type, equalTo(@"view_rent_ticket_contact_info"));

           return task;
       }];
        [tester waitForTimeInterval:5];
    });

    it(@"should have download app credit", ^ {

        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/credit/view_rent_ticket_contact_info/amount" parameters:nil resultClass:[CUTECredit class] resultKeyPath:@"val.credits"] continueWithBlock:^id(BFTask *task) {
            CUTECredit *downloadCredit = [task.result detect:^BOOL(CUTECredit *object) {
                return [object.tag isEqualToString:@"download_ios_app"];
            }];
            assertThat(downloadCredit, notNilValue());
            assertThat(downloadCredit.type, equalTo(@"view_rent_ticket_contact_info"));
            return task;
        }];
        [tester waitForTimeInterval:5];
    });

});

SpecEnd

//
//  CUTETicketUnitTest.m
//  currant
//
//  Created by Foster Yin on 6/19/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>
#define HC_SHORTHAND
#import <OCHamcrest/OCHamcrest.h>
#import "CUTETicket.h"

@interface CUTETicketUnitTest : XCTestCase

@end

@implementation CUTETicketUnitTest

- (void)setUp {
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}

- (void)testCustomTitle {
    CUTETicket *ticket = [CUTETicket new];
    ticket.title = @"good";
    assertThat(ticket.titleForDisplay, equalTo(@"good"));
}

- (void)testCommunityOrStreet {
    CUTETicket *ticket = [CUTETicket new];
    ticket.title = @"good";
    assertThat(ticket.titleForDisplay, equalTo(@"good"));
}

@end

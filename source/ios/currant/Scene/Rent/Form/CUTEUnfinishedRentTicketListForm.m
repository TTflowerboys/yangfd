//
//  CUTEUnfinishedRentTicketListForm.m
//  currant
//
//  Created by Foster Yin on 7/14/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUnfinishedRentTicketListForm.h"
#import "CUTEDataManager.h"
#import "CUTERentTicketPublisher.h"

@implementation CUTEUnfinishedRentTicketListForm

- (BFTask *)reloadWithCancellationToken:(BFCancellationToken *)cancellationToken {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    if ([CUTEDataManager sharedInstance].isUserLoggedIn) {
        [[[CUTERentTicketPublisher sharedInstance] syncTicketsWithCancellationToken:cancellationToken] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [tcs setError:task.error];
            }
            else if (task.exception) {
                [tcs setException:task.exception];
            }
            else if (task.isCancelled) {
                [tcs cancel];
            }
            else {
                self.unfinishedRentTickets = task.result;
                [tcs setResult:self.unfinishedRentTickets];
            }
            return task;
        }];
    }
    else {
        self.unfinishedRentTickets = [[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets];
        [tcs setResult:self.unfinishedRentTickets];
    }
    return tcs.task;
}

@end

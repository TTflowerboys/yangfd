//
//  CUTERentTickePublisher.m
//  currant
//
//  Created by Foster Yin on 4/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentTickePublisher.h"
#import <Bolts.h>
#import <Sequencer.h>
#import "CUTECommonMacro.h"
#import <NSArray+Frankenstein.h>
#import "CUTETicket.h"
#import "CUTEImageUploader.h"
#import "CUTEAPIManager.h"
#import "NSURL+Assets.h"

@interface CUTERentTickePublisher () {

    CUTEImageUploader *_imageUploader;

}

@end


@implementation CUTERentTickePublisher

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
    });

    return sharedInstance;
}

- (CUTEImageUploader *)imageUploader {
    if (!_imageUploader) {

        _imageUploader = [CUTEImageUploader new];
    }
    return _imageUploader;
}

- (BFTask *)createTicket:(CUTETicket *)ticket {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    Sequencer *sequencer = [Sequencer new];
    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[self editProperty:ticket.property] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [tcs setError:task.error];
            }
            else {
                completion(task.result);
            }
            return nil;
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/rent_ticket/add/" parameters:ticket.toParams resultClass:nil] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [tcs setError:task.error];
            }
            else {
                [tcs setResult:@{@"ticket_id":task.result, @"property_id":result}];
            }
            return nil;
        }];
    }];

    [sequencer run];
    return tcs.task;
}

- (BFTask *)editTicketExcludeImage:(CUTETicket *)ticket {
    return [BFTask taskForCompletionOfAllTasks:
            @[
              [self editProperty:ticket.property],
              [[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:ticket.toParams resultClass:nil]
              ]];
}

- (BFTask*)publishTicket:(CUTETicket *)ticket
{
    ticket.status = kTicketStatusToRent;
    return [BFTask taskForCompletionOfAllTasks:
            @[
              [self uploadImageAndEditProperty:ticket.property],
              [[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:ticket.toParams resultClass:nil]
              ]];
}

- (BFTask *)uploadImages:(NSArray *)images {
    return [BFTask taskForCompletionOfAllTasksWithResults:[images map:^id(NSString *object) {
        if ([[NSURL URLWithString:object] isAssetURL]) {
            return [[self imageUploader] uploadImageWithAssetURLString:object];
        }
        else {
            return [BFTask taskWithResult:object];
        }
    }]];
}

- (BFTask *)uploadImageAndEditProperty:(CUTEProperty *)property {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    if (property) {
        Sequencer *sequencer = [Sequencer new];
        if (!IsArrayNilOrEmpty([property realityImages])) {
            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
                [[self uploadImages:property.realityImages] continueWithBlock:^id(BFTask *task) {
                    if (task.result) {
                        property.realityImages = task.result;
                        completion(task.result);
                    }
                    else {
                        [tcs setError:task.error];
                    }
                    return nil;
                }];
            }];
        }

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[self editProperty:property] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [tcs setError:task.error];
                    return nil;
                } else {
                    property.identifier = task.result;
                    [tcs setResult:task.result];
                    return nil;
                }
            }];
        }];

        [sequencer run];
    }

    return tcs.task;
}

- (BFTask *)deleteTicket:(CUTETicket *)ticket {
    ticket.status = kTicketStatusDeleted;
    ticket.property.status = kPropertyStatusDeleted;
    return [BFTask taskForCompletionOfAllTasks:
            @[[self editProperty:ticket.property],
              [[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:ticket.toParams resultClass:nil]
              ]];
}

- (BFTask *)editProperty:(CUTEProperty *)property {
    NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:property.toParams];
    [params setObject:@"true" forKey:@"user_generated"];
    return [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/property/", property.identifier? : @"none" , @"/edit") parameters:params resultClass:nil] continueWithBlock:^id(BFTask *task) {
        if (task.error || task.exception || task.isCancelled) {
            return task;
        } else {
            if ([task.result isKindOfClass:[NSDictionary class]]) {
                return [BFTask taskWithResult:task.result[@"id"]];
            }
            return task;
        }
    }];
}

@end

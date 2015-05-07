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
#import <NSArray+ObjectiveSugar.h>
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
                ticket.property.identifier = task.result;
                completion(task.result);
            }
            return nil;
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:ticket.toParams];
        [params setObject:@"true" forKey:@"user_generated"];
        [[[CUTEAPIManager sharedInstance] POST:@"/api/1/rent_ticket/add/" parameters:params resultClass:nil] continueWithBlock:^id(BFTask *task) {
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
    NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:ticket.toParams];
    [params setObject:@"true" forKey:@"user_generated"];

    return [BFTask taskForCompletionOfAllTasks:
            @[
              [self editProperty:ticket.property],
              [[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:params resultClass:nil]
              ]];
}

- (BFTask*)publishTicket:(CUTETicket *)ticket updateStatus:(void (^)(NSString *status))updateStatus
{
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    Sequencer *sequencer = [Sequencer new];

    if (!IsArrayNilOrEmpty([ticket.property realityImages])) {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            if (updateStatus) {
                updateStatus([NSString stringWithFormat:STR(@"正在上传图片(%d/%d)..."), 0, ticket.property.realityImages.count]);
            }
            [[self uploadImages:ticket.property.realityImages updateStatus:^(NSString *status) {
                updateStatus(status);
            }] continueWithBlock:^id(BFTask *task) {
                if (task.result) {
                    ticket.property.realityImages = task.result;
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
        if (updateStatus) {
            updateStatus(STR(@"正在创建房产..."));
        }
        [[self editProperty:ticket.property] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [tcs setError:task.error];
                return nil;
            } else {
                ticket.property.identifier = task.result;
                completion(task.result);
                return nil;
            }
        }];
    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        if (updateStatus) {
            updateStatus(STR(@"正在创建房产出租单..."));
        }
        ticket.status = kTicketStatusToRent;
        NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:ticket.toParams];
        [params setObject:@"true" forKey:@"user_generated"];
        [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/rent_ticket/", ticket.identifier, @"/edit") parameters:params resultClass:nil] continueWithBlock:^id(BFTask *task) {
            if (task.error || task.exception || task.isCancelled) {
                [tcs setError:task.error];
            }
            else {
                [tcs setResult:task.result];
            }
            return nil;
        }];
    }];

    [sequencer run];
    return tcs.task;
}

- (BFTask *)uploadImages:(NSArray *)images updateStatus:(void (^) (NSString *status))updateStatus {
    NSArray *tasks = [images map:^id(NSString *object) {
        if ([[NSURL URLWithString:object] isAssetURL]) {
            return [[self imageUploader] uploadImageWithAssetURLString:object];
        }
        else {
            return [BFTask taskWithResult:object];
        }
    }];

    [tasks each:^(BFTask *task) {
        [task continueWithBlock:^id(BFTask *task) {
            if (updateStatus) {
                NSArray *completeTasks = [tasks select:^BOOL(BFTask *task) {
                    return task.isCompleted;
                }];
                updateStatus([NSString stringWithFormat:STR(@"正在上传图片(%d/%d)..."), completeTasks.count, tasks.count]);
            }
            return task;
        }];
    }];

    return [BFTask taskForCompletionOfAllTasksWithResults:tasks];
}

- (BFTask *)uploadPropertyImages:(CUTEProperty *)property {

    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    if (property) {
        Sequencer *sequencer = [Sequencer new];
        if (!IsArrayNilOrEmpty([property realityImages])) {
            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
                [[self uploadImages:property.realityImages updateStatus:nil] continueWithBlock:^id(BFTask *task) {
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

        if (property && property.identifier) {
            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
                NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:property.toRealityImagesParams];
                [params setObject:@"true" forKey:@"user_generated"];
                [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/property/", property.identifier, @"/edit") parameters:params resultClass:nil]  continueWithBlock:^id(BFTask *task) {
                    if (task.error || task.exception || task.isCancelled) {
                        [tcs setError:task.error];
                        return nil;
                    } else {
                        [tcs setResult:task.result];
                        return nil;
                    }
                }];
            }];
        }
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
